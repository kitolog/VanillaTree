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