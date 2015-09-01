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