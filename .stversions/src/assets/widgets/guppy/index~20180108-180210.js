$('document').ready(function() {
    $('#xml_btn').on('click', function() {
        createText('xml');
        $('#stuff').select();
    });
    $('#text_btn').on('click', function() {
        createText('text');
        $('#stuff').select();
    });
    $('#latex_btn').on('click', function() {
        createText('latex');
        $('#stuff').select();
    });
    $('#cm_btn').on('click', function() {
        createCM();
        $('#stuff').select();
    });
    $('#clear_btn').on('click', function() {
        $('#stuff').val('');
    });
    $('#btn_exp').on('click', function() {
        insert_string('^');
    });
    $('#btn_frac').on('click', function() {
        insert_string('/');
    });
    $('#btn_sub').on('click', function() {
        insert_string('_');
    });

    Guppy.get_symbols(["builtins","sym/symbols.json","sym/extra_symbols.json"]);
    var g1 = new Guppy("guppy1", {
	"events":{
	    //'debug':10,
            'right_end': function() {},
            'left_end': function() {},
            'done': function() { createText('text'); },
            'completion': completion,
	},
	"options":
	{
            //'blank_caret': "[?]",
	    //'autoreplace':true,
            'empty_content': "\\color{gray}{\\text{Click here to start typing a mathematical expression}}"
	}
    });
});

function flash_help(){
    $("#help_card").fadeIn(100).fadeOut(100).fadeIn(100).fadeOut(100).fadeIn(100);
}

function completion(data) {
    $('#stuff').value = "INFO: <br />"+data.candidates.join(", ");
}

function createText(texttype) {
    //clear screen
    var text = Guppy.instances.guppy1.get_content(texttype);
    console.log(text);
    $('#stuff').val(text.toString());
}

function createCM() {
    //clear screen
    var text = {
      type: 'LateX',
      object: Guppy.instances.guppy1.get_content('latex'),
      info: Guppy.instances.guppy1.get_content('text')
    };
    console.log(text);
    $('#stuff').val(JSON.stringify(text));
}
