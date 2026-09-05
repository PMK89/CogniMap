'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Quiz scheduling state + SM2-variant algorithm, ported verbatim from
 * dbprocess.js. Owns quizes.json persistence and the in-session quiz run
 * state (quizcmes/quizcat/quiztime).
 */
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const getDaysSinceEpoch = () => Math.round(Date.now() / DAY_IN_MS);

class QuizManager {
  /**
   * @param {string} dataDir directory containing quizes.json
   */
  constructor(dataDir) {
    this.file = path.join(dataDir, 'quizes.json');
    this.quizes = [];
    this.quizcmes = [];
    this.quiztime = [];
    this.quizcat = [];
    this.quizclick = 0;
    this._backedUp = false;
    this._loaded = false;
  }

  get today() {
    return getDaysSinceEpoch();
  }

  load() {
    if (this._loaded) return;
    if (fs.existsSync(this.file)) {
      const entries = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      if (!Array.isArray(entries)) throw new Error('quizes.json must contain an array');
      this.quizes = entries;
    }
    this._loaded = true;
  }

  save() {
    this.load();
    {
      if (!this._backedUp && fs.existsSync(this.file)) {
        const backupDir = path.join(path.dirname(this.file), 'backups');
        fs.mkdirSync(backupDir, { recursive: true });
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        fs.copyFileSync(this.file, path.join(backupDir, `quizes.json.${stamp}.bak`));
        this._backedUp = true;
      }
      const temporary = this.file + '.writing';
      fs.writeFileSync(temporary, JSON.stringify(this.quizes, null, 2));
      fs.renameSync(temporary, this.file);
    }
  }

  /**
   * SM2-variant recalculation — identical math to dbprocess.js calculate().
   * Ratings < 3 reset the interval; < 4 re-queues the element in this session.
   */
  calculate(word, performanceRating, today) {
    let timeinterval = 1;
    let interval;
    let difficulty;
    if (performanceRating < 3) {
      difficulty = word.difficulty;
      interval = 1;
    } else {
      difficulty = Math.max(
        word.difficulty +
          (0.1 - (5 - performanceRating) * (0.08 + (5 - performanceRating) * 0.02)),
        1.3
      );
      if (word.interval === 1) {
        timeinterval = 1;
      } else if (word.interval === 2) {
        timeinterval = 6;
      } else {
        timeinterval = Math.max(Math.ceil((word.interval - 1) * difficulty), 6);
      }
      interval = word.interval + 1;
    }
    if (performanceRating < 4) {
      const pos0 = this.quizcmes.findIndex((i) => i.id === word.id);
      if (pos0 > -1 && this.quizcmes[pos0]) {
        timeinterval = -100;
        this.quizcmes.push(this.quizcmes[pos0]);
      }
    }
    return {
      difficulty,
      interval,
      update: today + timeinterval,
      word: word.id,
    };
  }

  /** ported from makeQuiz() */
  makeQuiz(id, dif, int, cat0) {
    if (!id) return;
    this.load();
    let cat = [];
    if (cat0) {
      if (cat0.length > 3) {
        cat = cat0.slice(0, 3);
      } else {
        cat = cat0.slice();
        for (let i = 0; i < 3 - cat0.length; i++) cat.push('none');
      }
    }
    if (this.quizes.findIndex((i) => i.id === id) === -1) {
      this.quizes.push({ id, cat, update: this.today, difficulty: 2.5, interval: 1 });
      this.save();
    }
  }

  /** ported from changeQuiz() */
  changeQuiz(id, dif, int, cat0) {
    if (!id) return;
    this.load();
    let cat = [];
    if (cat0) {
      cat = cat0.length > 3 ? cat0.slice(0, 3) : cat0;
    }
    const pos = this.quizes.findIndex((i) => i.id === id);
    if (pos > -1) {
      this.quizes[pos].difficulty = Math.max(dif, 1.3);
      this.quizes[pos].interval = int;
      this.quizes[pos].cat = cat;
      this.save();
    } else {
      this.makeQuiz(id, dif, int, cat0);
    }
  }

  /** ported from deleteQuiz() */
  deleteQuiz(id) {
    this.load();
    const pos = this.quizes.findIndex((i) => i.id === id);
    if (pos > -1) {
      this.quizes.splice(pos, 1);
      this.save();
    }
  }
}

module.exports = { QuizManager, getDaysSinceEpoch };
