var TreeModel = function () {
    var treeData = {
            elements: {},
            map: {},
            maxId: 0
        },
        storageService = new StorageService();

    var init = function () {

        var elementsData = storageService.getObject('tree');
        if ((typeof elementsData == 'object') && elementsData) {
            treeData.elements = elementsData;
            setupMap(treeData.elements);
        }
    };

    var setupMap = function (elementsData) {
        var key;
        for (key in elementsData) {
            treeData.map[key] = elementsData[key];

            if (key > treeData.maxId) {
                treeData.maxId = key;
            }

            if (typeof elementsData[key]['elements'] == 'object') {
                setupMap(elementsData[key]['elements']);
            }
        }
    };

    var addElement = function (name, parentId, callback) {
        if (name && name.length) {
            var parent;
            if ((typeof parentId == 'undefined') || (typeof treeData.map[parentId] == 'undefined') || !treeData.map[parentId]) {
                parent = treeData;
            } else {
                parent = treeData.map[parentId];
            }

            if ((typeof parent['elements'] == 'undefined') || !parent['elements']) {
                parent['elements'] = {};
            }

            treeData.maxId++;

            parent['elements'][treeData.maxId] = {
                id: treeData.maxId,
                parentId: parentId,
                name: name,
                elements: {}
            };

            treeData.map[treeData.maxId] = parent['elements'][treeData.maxId];

            storageService.setObject('tree', treeData.elements);

            if (typeof callback == 'function') {
                callback(parent['elements'][treeData.maxId]);
            }

        }
    };

    var editElement = function (name, element, callback) {
        if ((typeof element == 'object') && element && (name && name.length)) {
            element['name'] = name;
            storageService.setObject('tree', treeData.elements);

            if (typeof callback == 'function') {
                callback(element)
            }
        }
    };

    var removeElement = function (elementId, callback) {
        if ((typeof elementId != 'undefined') && elementId && (typeof treeData.map[elementId] == 'object') && treeData.map[elementId]) {

            var element = treeData.map[elementId];

            var removeCallback = function () {
                delete treeData.map[elementId];
                storageService.setObject('tree', treeData.elements);

                if (typeof callback == 'function') {
                    callback()
                }
            };

            if ((typeof element['parentId'] != 'undefined') && element['parentId']) {
                getElement(element['parentId'], function (parentElement) {
                    if ((typeof parentElement == 'object') && parentElement && (typeof parentElement['elements'] == 'object') && (typeof parentElement['elements'][element['id']] == 'object')) {
                        delete parentElement['elements'][element['id']];
                        removeCallback();
                    } else {
                        removeCallback();
                    }
                });
            } else {
                delete treeData['elements'][element['id']];
                removeCallback();
            }
        }
    };

    var getNestedParents = function (element, callback, parentsArray) {
        if ((typeof element == 'object') && (typeof element['parentId'] != 'undefined') && element['parentId']) {

            if (typeof parentsArray == 'undefined') {
                parentsArray = [];
            }

            getElement(element['parentId'], function (parentElement) {
                if ((typeof parentElement != 'undefined') && parentElement) {
                    parentsArray.unshift(parentElement);

                    if ((typeof parentElement['parentId'] != 'undefined') && parentElement['parentId']) {
                        getNestedParents(parentElement, callback, parentsArray);
                    } else if (typeof callback == 'function') {
                        callback(parentsArray);
                    }
                } else if (typeof callback == 'function') {
                    callback(parentsArray);
                }
            });
        } else if (typeof callback == 'function') {
            callback(parentsArray)
        }
    };

    var getElement = function (key, callback) {
        if (key && (typeof treeData.map[key] == 'object') && treeData.map[key]) {
            if (typeof callback == 'function') {
                callback(treeData.map[key]);
            }
        } else {
            if (typeof callback == 'function') {
                callback(null);
            }
        }
    };

    init();

    return {
        addElement: function (name, parentId, callback) {
            addElement(name, parentId, callback);
        },
        editElement: function (name, element, callback) {
            editElement(name, element, callback);
        },
        removeElement: function (element, callback) {
            removeElement(element, callback);
        },
        getElement: function (index, callback) {
            getElement(index, callback);
        },
        getAll: function () {
            return treeData.elements;
        }
    };
};