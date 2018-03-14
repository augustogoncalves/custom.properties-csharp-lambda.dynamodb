$(document).ready(function () {
    prepareDBTree();
});

function prepareDBTree() {
    $('#dbTree').jstree({
        'core': {
            'themes': { "icons": true },
            'multiple': true,
            'data': {
                "url": 'https://9tevqm5cke.execute-api.us-west-2.amazonaws.com/Prod/api/objectcode',
                "dataType": "json",
                'multiple': true,
                'data': function (node) {
                    $('#dbTree').jstree(true).toggle_node(node);
                    return { "id": node.id };
                },
                "cache": false,
                "success": function (nodes) {
                    nodes.forEach(function (node) {
                        node.text = node.id + ' - ' + node.text;
                        node.children = true;
                    })
                }
            }
        },
        'types': {
            'default': {
                'icon': 'glyphicon glyphicon-file'
            }
        },
        "plugins": ["types", "state", "sort", "search"],
        "state": { "key": "objectCodeTree" }
    }).bind("activate_node.jstree", function (evt, data) {
        loadObjectCode(data.node);
    });

    $('#refreshDBTree').click(function () {
        $('#dbTree').jstree(true).refresh();
    })

    var to = false;
    $('#searchObjectCode').keyup(function () {
        if (to) { clearTimeout(to); }
        to = setTimeout(function () {
            var v = $('#searchObjectCode').val();
            $('#dbTree').jstree(true).search(v);
        }, 250);
    });
}
