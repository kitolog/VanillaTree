var HtmlHelper = {
    getElementByClassName: function (className, parentNode) {

        if ((typeof parentNode == 'undefined') || !(parentNode instanceof Node)) {
            parentNode = document;
        }

        var element = null,
            elementsByClassName = parentNode.getElementsByClassName(className);

        if (elementsByClassName.length) {
            element = elementsByClassName[0];
        }

        return element;
    },
    getElementByTagName: function (tagName, parentNode) {

        if ((typeof parentNode == 'undefined') || !(parentNode instanceof Node)) {
            parentNode = document;
        }

        var element = null,
            elementsByTagName = parentNode.getElementsByTagName(tagName);

        if (elementsByTagName.length) {
            element = elementsByTagName[0];
        }

        return element;
    },
    removeElementClass: function (elementNode, classname) {
        if ((typeof elementNode == 'object') && (elementNode instanceof Node) && (typeof classname == 'string') && classname.length) {
            elementNode.className = elementNode.className.replace(classname, '');
        }
    },
    addElementClass: function (elementNode, classname) {
        if ((typeof elementNode == 'object') && (elementNode instanceof Node) && (typeof classname == 'string') && classname.length) {
            if (!this.hasElementClass(elementNode, classname)) {
                elementNode.className = elementNode.className + ' ' + classname;
            }
        }
    },
    hasElementClass: function (elementNode, classname) {
        if ((typeof elementNode == 'object') && (elementNode instanceof Node) && (typeof classname == 'string') && classname.length) {
            return elementNode.className.indexOf(classname) >= 0;
        }
    },
    renderAddElementForm: function (submitCallback, parentNode) {
        var form,
            btnCancel,
            formTemplate = HtmlHelper.getElementByClassName('form-template');

        if (formTemplate && (formTemplate instanceof Node)) {
            form = formTemplate.cloneNode(true);

            HtmlHelper.removeElementClass(form, 'form-template');

            if ((typeof parentNode != 'object') || !(parentNode instanceof Node)) {
                parentNode = HtmlHelper.getElementByClassName('root-tree');
            }

            if ((typeof parentNode == 'object') && (parentNode instanceof Node)) {
                parentNode.appendChild(form);

                btnCancel = HtmlHelper.getElementByClassName('button-cancel', form);
                if ((typeof btnCancel == 'object') && (btnCancel instanceof Node)) {
                    btnCancel.onclick = function () {
                        parentNode.removeChild(form);
                    };
                }

                form.onsubmit = function () {
                    if (typeof submitCallback == 'function') {
                        submitCallback(this);
                    }
                    return false;
                };
            } else {
                console.warn('parentNode is not instance of Node!');
            }
        }
    },
    renderEditElementForm: function (submitCallback, elementData, elementNode) {
        var form,
            btnCancel,
            containerNode,
            formTemplate;

        if ((typeof elementData == 'object') && (typeof elementNode == 'object') && (elementNode instanceof Node)) {

            formTemplate = HtmlHelper.getElementByClassName('form-template');
            if (formTemplate && (formTemplate instanceof Node)) {
                form = formTemplate.cloneNode(true);

                HtmlHelper.removeElementClass(form, 'form-template');

                var nameInput = HtmlHelper.getElementByTagName('input', form);
                if ((typeof nameInput == 'object') && (nameInput instanceof Node)) {
                    nameInput.value = elementData['name'];
                }

                containerNode = HtmlHelper.getElementByClassName('element-container', elementNode);
                if (containerNode && (containerNode instanceof Node)) {
                    elementNode.replaceChild(form, containerNode);

                    btnCancel = HtmlHelper.getElementByClassName('button-cancel', form);
                    if ((typeof btnCancel == 'object') && (btnCancel instanceof Node)) {
                        btnCancel.onclick = function () {
                            elementNode.replaceChild(containerNode, form);
                        };
                    }

                    form.onsubmit = function () {
                        if (typeof submitCallback == 'function') {
                            submitCallback(this, elementData);
                        }
                        return false;
                    };
                }
            }
        }
    }
};
var StorageService = function () {
    var storage = {
        set: function (key, value) {
        },
        get: function (key, defaultValue) {
        },
        remove: function (key) {
        },
        setObject: function (key, value) {
        },
        getObject: function (key) {
        }
    };

    if ((typeof window['localStorage'] != 'undefined') && window.localStorage) {
        storage.set = function (key, value) {
            window.localStorage[key] = value;
        };
        storage.get = function (key, defaultValue) {
            return window.localStorage[key] || defaultValue;
        };
        storage.remove = function (key) {
            delete window.localStorage[key];
        };
        storage.setObject = function (key, value) {
            if ((typeof JSON != 'undefined') && JSON && (typeof JSON['stringify'] == 'function')) {
                window.localStorage[key] = JSON.stringify(value);
            } else {
                window.localStorage[key] = value;
            }
        };
        storage.getObject = function (key) {

            var result;
            if ((typeof JSON != 'undefined') && JSON && (typeof JSON['stringify'] == 'function')) {
                result = JSON.parse(window.localStorage[key] || '{}');
            } else {
                result = window.localStorage[key] || '{}'
            }

            return result;
        };
    } else {
        console.warn('localStorage is not defined');
    }

    return storage;
};
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
var VanillaTree = {
    treeModel: {},
    init: function () {
        this.treeModel = new TreeModel();
        this.initButtons();


        var elementsData = this.treeModel.getAll();
        if (typeof elementsData == 'object') {
            this.renderElementsTree(elementsData);
        }
    },
    initButtons: function () {
        var _this = this,
            btnAddRoot = HtmlHelper.getElementByClassName('btn-add-root');
        if (btnAddRoot && (btnAddRoot instanceof Node)) {
            btnAddRoot.onclick = function () {
                HtmlHelper.renderAddElementForm(_this.addElement.bind(_this));
            }
        }
    },
    renderElementsTree: function (elements, parentNode) {
        if ((typeof elements == 'object') && elements) {

            var key,
                elementData,
                treeNode,
                _this = this;

            if ((typeof parentNode != 'object') || !(parentNode instanceof Node)) {
                treeNode = HtmlHelper.getElementByClassName('root-tree');
            } else {
                treeNode = HtmlHelper.getElementByClassName('tree', parentNode);
                if (!(typeof treeNode == 'object') || !(treeNode instanceof Node)) {
                    var treeBlockTemplate = HtmlHelper.getElementByClassName('list-template');

                    if (treeBlockTemplate && (treeBlockTemplate instanceof Node)) {
                        treeNode = treeBlockTemplate.cloneNode(true);
                        HtmlHelper.removeElementClass(treeNode, 'list-template');
                        parentNode.appendChild(treeNode);
                    }
                }
            }

            for (key in elements) {
                elementData = elements[key];
                this.createElementNode(elementData, function (elementNode) {
                    treeNode.appendChild(elementNode);

                    if ((typeof elementData['elements'] == 'object') && elementData['elements']) {
                        _this.renderElementsTree(elementData['elements'], elementNode);
                    }
                });
            }
        }
    },
    validateInput: function (elementNode) {
        var value;
        if (elementNode.value.length) {
            value = elementNode.value;
        } else {
            HtmlHelper.addElementClass(elementNode.parentElement, 'has-error');
            elementNode.setAttribute('placeholder', 'Must not be empty!');
        }

        return value;
    },
    addElement: function (form) {
        if (form && (form instanceof Node)) {
            var _this = this,
                nameInput = HtmlHelper.getElementByTagName('input', form);

            if ((typeof nameInput == 'object') && (nameInput instanceof Node)) {
                var name = this.validateInput(nameInput);

                if (name && name.length) {
                    var parentNode = form.parentNode,
                        parentId;

                    if (typeof parentNode['elementId'] != 'undefined') {
                        parentId = parentNode['elementId'];
                    }

                    this.treeModel.addElement(name, parentId, function (elementData) {
                        if ((typeof elementData == 'object') && elementData && (typeof elementData['name'] != 'undefined') && elementData['name'].length) {
                            _this.createElementNode(elementData, function (elementNode) {
                                parentNode.removeChild(form);

                                var treeNode = HtmlHelper.getElementByClassName('tree', parentNode);
                                if (!(typeof treeNode == 'object') || !(treeNode instanceof Node)) {
                                    var treeBlockTemplate = HtmlHelper.getElementByClassName('list-template');

                                    if (treeBlockTemplate && (treeBlockTemplate instanceof Node)) {
                                        treeNode = treeBlockTemplate.cloneNode(true);
                                        HtmlHelper.removeElementClass(treeNode, 'list-template');
                                        parentNode.appendChild(treeNode);
                                    }
                                }

                                treeNode.appendChild(elementNode);
                            });
                        }
                    });
                }
            } else {
                console.warn('nameInput is not instance of Node!');
            }
        } else {
            console.warn('form is not instance of Node!');
        }
    },
    //renderEditElementForm: function (elementNode) {
    //    var form,
    //        btnCancel,
    //        _this = this,
    //        elementId = elementNode.elementId,
    //        containerNode,
    //        formTemplate;
    //
    //    if (typeof elementId != 'undefined') {
    //        this.treeModel.getElement(elementId, function (elementData) {
    //            if (typeof elementData == 'object') {
    //
    //                formTemplate = HtmlHelper.getElementByClassName('form-template');
    //                if (formTemplate && (formTemplate instanceof Node)) {
    //                    form = formTemplate.cloneNode(true);
    //
    //                    HtmlHelper.removeElementClass(form, 'form-template');
    //
    //                    var nameInput = HtmlHelper.getElementByTagName('input', form);
    //                    if ((typeof nameInput == 'object') && (nameInput instanceof Node)) {
    //                        nameInput.value = elementData['name'];
    //                    }
    //
    //                    containerNode = HtmlHelper.getElementByClassName('element-container', elementNode);
    //                    if (containerNode && (containerNode instanceof Node)) {
    //                        elementNode.replaceChild(form, containerNode);
    //
    //                        btnCancel = HtmlHelper.getElementByClassName('button-cancel', form);
    //                        if ((typeof btnCancel == 'object') && (btnCancel instanceof Node)) {
    //                            btnCancel.onclick = function () {
    //                                elementNode.replaceChild(containerNode, form);
    //                            };
    //                        }
    //
    //                        form.onsubmit = function () {
    //                            _this.editElement(this, elementData);
    //                            return false;
    //                        };
    //                    }
    //                }
    //            }
    //        });
    //    }
    //},
    editElement: function (form, elementData) {
        if (form && (form instanceof Node)) {
            var _this = this,
                nameInput = HtmlHelper.getElementByTagName('input', form);

            if ((typeof nameInput == 'object') && (nameInput instanceof Node)) {
                var name = this.validateInput(nameInput);

                if (name && name.length) {
                    this.treeModel.editElement(name, elementData, function (newElementData) {
                        if ((typeof newElementData == 'object') && newElementData && (typeof newElementData['name'] != 'undefined') && newElementData['name'].length) {
                            _this.updateElementNode(newElementData, form);
                        }
                    });
                }
            } else {
                console.warn('nameInput is not instance of Node!');
            }
        } else {
            console.warn('editElement form is not instance of Node!');
        }
    },
    removeElement: function (elementNode) {
        if (elementNode && (elementNode instanceof Node)) {
            var _this = this,
                parentNode = elementNode.parentNode,
                elementId = elementNode.elementId;

            if (typeof elementId != 'undefined') {
                this.treeModel.getElement(elementId, function (elementData) {
                    if (typeof elementData == 'object') {
                        _this.treeModel.removeElement(elementData['id'], function () {
                            parentNode.removeChild(elementNode);
                        });
                    }
                });
            }
        }
    },
    createElementNode: function (elementData, callback) {
        if (elementData) {

            var elementNode,
                elementTemplate = HtmlHelper.getElementByClassName('element-template');

            if (elementTemplate && (elementTemplate instanceof Node)) {
                elementNode = elementTemplate.cloneNode(true);

                HtmlHelper.removeElementClass(elementNode, 'element-template');
                elementNode.elementId = elementData['id'];

                var containerNode = HtmlHelper.getElementByClassName('element-container', elementNode);
                if ((typeof containerNode == 'object') && (containerNode instanceof Node)) {
                    this.prepareElementDataContainer(elementData, elementNode, containerNode);
                }

                if (typeof callback == 'function') {
                    callback(elementNode);
                }
            } else {
                console.warn('form is not instance of Node!');
            }
        }
    },
    updateElementNode: function (elementData, form) {
        if (form && (form instanceof Node) && elementData) {

            var elementNode,
                elementTemplate,
                parentNode = form.parentNode;

            elementTemplate = HtmlHelper.getElementByClassName('element-template');

            if (elementTemplate && (elementTemplate instanceof Node)) {
                elementNode = elementTemplate.cloneNode(true);

                HtmlHelper.removeElementClass(elementNode, 'element-template');
                elementNode.elementId = elementData['id'];

                var containerNode = HtmlHelper.getElementByClassName('element-container', elementNode);
                if ((typeof containerNode == 'object') && (containerNode instanceof Node)) {
                    this.prepareElementDataContainer(elementData, parentNode, containerNode);
                    parentNode.replaceChild(containerNode, form);
                }

            } else {
                console.warn('form is not instance of Node!');
            }
        }
    },
    prepareElementDataContainer: function (elementData, elementNode, containerNode) {

        if (elementNode && (elementNode instanceof Node) && elementData) {

            var _this = this;

            if (containerNode && (containerNode instanceof Node)) {

                var nameBlock = HtmlHelper.getElementByClassName('name', containerNode);
                if ((typeof nameBlock == 'object') && (nameBlock instanceof Node)) {
                    nameBlock.textContent = elementData['name'];
                } else {
                    console.warn('nameBlock is not instance of Node!');
                }

                var btnAdd = HtmlHelper.getElementByClassName('button-add', containerNode);
                if ((typeof btnAdd == 'object') && (btnAdd instanceof Node)) {
                    btnAdd.onclick = function () {
                        HtmlHelper.renderAddElementForm(_this.addElement.bind(_this), elementNode);
                    }
                } else {
                    console.warn('btnAdd is not instance of Node!');
                }

                var btnEdit = HtmlHelper.getElementByClassName('button-edit', containerNode);
                if ((typeof btnEdit == 'object') && (btnEdit instanceof Node)) {
                    btnEdit.onclick = function () {
                        var elementId = elementNode.elementId;
                        if (typeof elementId != 'undefined') {
                            _this.treeModel.getElement(elementId, function (elementData) {
                                if (typeof elementData == 'object') {
                                    HtmlHelper.renderEditElementForm(_this.editElement.bind(_this), elementData, elementNode);
                                }
                            });
                        }
                    }
                } else {
                    console.warn('btnEdit is not instance of Node!');
                }

                var btnRemove = HtmlHelper.getElementByClassName('button-remove', containerNode);
                if ((typeof btnRemove == 'object') && (btnRemove instanceof Node)) {
                    btnRemove.onclick = function () {
                        _this.removeElement(elementNode);
                    }
                } else {
                    console.warn('btnRemove is not instance of Node!');
                }
            } else {
                console.warn('form is not instance of Node!');
            }
        }
    }
};

window.onload = function () {
    VanillaTree.init();
};