var baseURL = 'https://9tevqm5cke.execute-api.us-west-2.amazonaws.com/Prod/api';

$(document).ready(function () {
    $('[rel=tooltip]').tooltip({ trigger: "hover" });
    $('#createNew').click(createNew);
    $("#editorPanel").hide();
    $("#saveCode").click(saveCode);
    $("#isRoot").change(function () {
        $("#parent").prop('disabled', this.checked);
    });
});

function createNew() {
    $("#editorPanel").fadeIn("fast", function () {
        $("#code").val('').prop('disabled', false);
        $("#name").val('');
        $("#type").val('');
        $("#description").val('');
    });
}

function saveCode() {
    $("#saveCode").text("Saving...").prop('disabled', true);
    $.ajax({
        url: baseURL + '/objectcode/' + $("#code").val(),
        type: 'PUT',
        contentType: "application/json; charset=utf-8",
        dataType: 'text', // that's the response, which is empty
        data: JSON.stringify(
            {
                "codeId": $("#code").val(),
                "parentId": ($("#isRoot").is(":checked") ? 'ROOT' : $("#parent").val()),
                "name": $("#name").val(),
                "type": $("#type").val(),
                "description": $("#description").val()
            }
        ),
        success: function (data) {
            $("#editorPanel").fadeOut("fast");
            $('#dbTree').jstree(true).refresh();
            $("#saveCode").text("Save").prop('disabled', false);
        },
        error: function (error) {
            $("#saveCode").text("Ops, something went wrong. Try again?").prop('disabled', false);
        }
    });
}

function loadObjectCode(treeNode) {
    $("#editorPanel").fadeOut("fast", function () {
        $.ajax({
            url: baseURL + '/objectcode/' + treeNode.id,
            type: 'GET',
            success: function (data) {
                var isRoot = (data.parentId === 'ROOT');
                $("#code").val(data.codeId);
                $("#parent").val((isRoot ? '' : data.parentId)).prop('disabled', isRoot);
                $("#name").val(data.name);
                $("#type").val(data.type);
                $("#description").val(data.description);
                $("#isRoot").attr('checked', isRoot);
                $("#editorPanel").fadeIn("slow", function () {

                });
            },
            complete: function (data) {

            },
            fail: function (data) {

            }
        });
    });
}