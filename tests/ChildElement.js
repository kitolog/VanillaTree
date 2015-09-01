describe('ChildElement', function () {

    var testParentElementName = 'testName' + Math.ceil(Math.random() * 100),
        testChildElementName = 'testChildName' + Math.ceil(Math.random() * 100),
        testSubChildElementName = 'testSubChildName' + Math.ceil(Math.random() * 100),
        testElementNameUpdated = testChildElementName + 'Updated',
        treeModel = new TreeModel();

    it('Set new child element', function () {

        treeModel.addElement(testParentElementName, null, function (parentElement) {

            expect(parentElement).toBeDefined();

            treeModel.addElement(testChildElementName, parentElement, function (childElement) {

                expect(childElement).toBeDefined();
                expect(childElement['id']).toBeDefined();

                treeModel.getElement(childElement['id'], function (foundChildElement) {
                    expect(foundChildElement).toBeDefined();
                    expect(foundChildElement).toEqual(childElement);
                });
            });
        });
    });

    it('Set new subchild element', function () {

        treeModel.getElement(2, function (foundElement) {
            expect(foundElement).toBeDefined();
            expect(foundElement['name']).toEqual(testChildElementName);

            treeModel.addElement(testSubChildElementName, foundElement, function (subChildElement) {

                expect(subChildElement).toBeDefined();
                expect(subChildElement['id']).toBeDefined();

                treeModel.getElement(subChildElement['id'], function (foundChildElement) {
                    expect(foundChildElement).toBeDefined();
                    expect(foundChildElement).toEqual(subChildElement);
                });
            });
        });
    });

    it('Edit child element', function () {

        treeModel.getElement(2, function (foundElement) {
            expect(foundElement).toBeDefined();
            expect(foundElement['name']).toEqual(testChildElementName);

            treeModel.editElement(testElementNameUpdated, foundElement, function (updatedElement) {
                expect(updatedElement).toBeDefined();
                expect(updatedElement['name']).not.toEqual(testChildElementName);
                expect(updatedElement['name']).toEqual(testElementNameUpdated);
            });
        });
    });

    it('Deletes child element', function () {

        expect(treeModel.getElement(2, function (foundElement) {
            expect(foundElement).toBeDefined();
            expect(foundElement['id']).toBeDefined();

            treeModel.removeElement(foundElement, function () {
                treeModel.getElement(2, function (foundElement) {
                    expect(foundElement).toBeNull();
                });
            });
        }));
    });

    it('Set new child element and remove parent', function () {

        expect(treeModel.getElement(1, function (foundElement) {
            expect(foundElement).toBeDefined();
            expect(foundElement['id']).toBeDefined();

            treeModel.removeElement(foundElement, function () {
                treeModel.getElement(1, function (foundElement) {
                    expect(foundElement).toBeNull();
                });

                treeModel.getElement(2, function (foundElement) {
                    expect(foundElement).toBeNull();
                });

                treeModel.getElement(3, function (foundElement) {
                    expect(foundElement).toBeNull();
                });
            });
        }));
    });
});
