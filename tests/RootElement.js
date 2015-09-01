describe('RootElement', function () {

    var testElementName = 'testName' + Math.ceil(Math.random() * 100),
        testElementNameUpdated = testElementName + 'Updated',
        treeModel = new TreeModel();

    it('Set new root element', function () {

        treeModel.addElement(testElementName, null, function (element) {

            expect(element).toBeDefined();
            expect(element['id']).toBeDefined();
            treeModel.getElement(element['id'], function (foundElement) {
                expect(foundElement).toBeDefined();
                expect(foundElement).toEqual(element);
            });
        });
    });

    it('Edit root element', function () {

        treeModel.getElement(1, function (foundElement) {
            expect(foundElement).toBeDefined();

            treeModel.editElement(testElementNameUpdated, foundElement, function (updatedElement) {
                expect(updatedElement).toBeDefined();
                expect(updatedElement['name']).not.toEqual(testElementName);
                expect(updatedElement['name']).toEqual(testElementNameUpdated);
            });
        });
    });

    it('Deletes root element', function () {

        expect(treeModel.getElement(1, function (foundElement) {
            expect(foundElement).toBeDefined();
            expect(foundElement['id']).toBeDefined();

            treeModel.removeElement(foundElement, function () {
                treeModel.getElement(1, function (foundElement) {
                    expect(foundElement).toBeNull();
                });
            });
        }));
    });
});