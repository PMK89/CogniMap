import { ipcMain, IpcMainEvent } from "electron";
import * as fs from "fs/promises";
import * as path from "path";
import CMSettings from "./models/settings";
import CMButton from "./models/button";
import CMColor from "./models/color";
import { CME, CMEl, CMEo } from "./models/cmelement";

interface Settings extends Omit<CMSettings, "cmobjects"> {
  id: number;
  mode: "view" | "quizing" | "edit";
  cmobjects: Array<CME | CMEl | CMEo>;
}

interface Button {
  id: number;
  [key: string]: any;
}

interface Color {
  id: number;
  cat: string;
  prio: number;
  [key: string]: any;
}

interface Template {
  id: string;
  state: string;
  [key: string]: any;
}

let settings: Settings[];
let colors: Color[];
let spechars: any[];
let buttons: Button[];
let templates: Template[];

async function loadDataFiles() {
  try {
    const settingsData = await fs.readFile("./data/settings.json", "utf-8");
    settings = JSON.parse(settingsData);

    const colorsData = await fs.readFile("./data/colors.json", "utf-8");
    colors = JSON.parse(colorsData);

    const specharsData = await fs.readFile("./data/spechars.json", "utf-8");
    spechars = JSON.parse(specharsData);

    const buttonsData = await fs.readFile("./data/buttons.json", "utf-8");
    buttons = JSON.parse(buttonsData);

    const templatesData = await fs.readFile("./data/templates.json", "utf-8");
    templates = JSON.parse(templatesData);
  } catch (error) {
    console.error("Error loading data files:", error);
    throw error;
  }
}

// Initialize data on startup
loadDataFiles().catch(console.error);

// Settings Handlers
ipcMain.on("loadSettings", (event: IpcMainEvent, id: string) => {
  const settingId = parseInt(id);
  const setting = settings.find((s) => s.id === settingId);
  event.returnValue = setting || null;
});

ipcMain.on("changeSettings", async (event: IpcMainEvent, arg: Settings) => {
  try {
    const index = settings.findIndex((s) => s.id === arg.id);
    if (index !== -1) {
      settings[index] = {
        ...arg,
        mode: arg.mode !== "view" && arg.mode !== "quizing" ? "edit" : arg.mode,
      };

      await fs.writeFile(
        "./data/settings.json",
        JSON.stringify(settings, null, 2)
      );
      event.sender.send("changedSettings", settings[index]);
    }
  } catch (error) {
    console.error("Error changing settings:", error);
  }
});

// Button Handlers
ipcMain.on("loadButtons", (event: IpcMainEvent) => {
  event.sender.send("loadedButtons", buttons);
});

ipcMain.on("changeButtons", (event: IpcMainEvent, arg: Button) => {
  const index = buttons.findIndex((b) => b.id === arg.id);
  if (index !== -1) {
    buttons[index] = arg;
    event.sender.send("changedButtons", buttons[index]);
  }
});

// Color Handlers
ipcMain.on("loadColors", (event: IpcMainEvent) => {
  event.sender.send("loadedColors", colors);
});

ipcMain.on("changeColors", async (event: IpcMainEvent, arg: Color) => {
  try {
    const index = colors.findIndex((c) => c.id === arg.id);
    if (index !== -1) {
      colors[index] = arg;
      await fs.writeFile("./data/colors.json", JSON.stringify(colors, null, 2));
      event.sender.send("changedColors", colors);
    }
  } catch (error) {
    console.error("Error changing colors:", error);
  }
});

ipcMain.on("changeAllColors", async (event: IpcMainEvent, arg: Color[]) => {
  try {
    colors = arg;
    await fs.writeFile("./data/colors.json", JSON.stringify(arg, null, 2));
    event.sender.send("changedColors", colors);
  } catch (error) {
    console.error("Error changing all colors:", error);
  }
});

ipcMain.on("addColors", async (event: IpcMainEvent, arg: Color) => {
  try {
    const maxId = colors.reduce((max, color) => Math.max(max, color.id), 0);
    colors.forEach((color) => {
      if (color.cat === arg.cat && color.prio === 0) {
        color.prio = 1;
      }
    });

    const newColor = { ...arg, id: maxId + 1 };
    colors.push(newColor);

    await fs.writeFile("./data/colors.json", JSON.stringify(colors, null, 2));
    event.sender.send("changedColors", colors);
  } catch (error) {
    console.error("Error adding color:", error);
  }
});

// Special Characters Handlers
ipcMain.on("loadSpeChars", (event: IpcMainEvent) => {
  event.returnValue = spechars;
});

ipcMain.on("changeSpeChars", async (event: IpcMainEvent, arg: any) => {
  try {
    spechars = arg;
    await fs.writeFile(
      "./data/spechars.json",
      JSON.stringify(spechars, null, 2)
    );
    event.returnValue = "changeSpeChars";
  } catch (error) {
    console.error("Error changing special characters:", error);
  }
});

// Template Handlers
ipcMain.on("loadTemplates", (event: IpcMainEvent) => {
  event.returnValue = templates;
});

ipcMain.on("changeTemplate", async (event: IpcMainEvent, arg: Template) => {
  try {
    const index = templates.findIndex((t) => t.id === arg.id);
    if (index !== -1) {
      templates[index] = { ...arg, state: "" };
      await fs.writeFile(
        "./data/templates.json",
        JSON.stringify(templates, null, 2)
      );
      event.sender.send("changedTemplate", templates[index]);
    }
  } catch (error) {
    console.error("Error changing template:", error);
  }
});

ipcMain.on("newTemplate", async (event: IpcMainEvent, arg: Template) => {
  try {
    const exists = templates.some((t) => t.id === arg.id);
    if (!exists) {
      templates.push(arg);
      await fs.writeFile(
        "./data/templates.json",
        JSON.stringify(templates, null, 2)
      );
      event.sender.send("newTemplateResponse", "saved");
    } else {
      event.sender.send("newTemplateResponse", "error");
    }
  } catch (error) {
    console.error("Error adding new template:", error);
  }
});
