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