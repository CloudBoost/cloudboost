module.exports = {
    "parserOptions": {
        "ecmaVersion": 8,
        "sourceType": "module"
    },
    "extends": ["eslint:recommended"],
    "env": {
        "node": true,
        "es6": true
    },
    "rules": {
        "for-direction": "off",
        "getter-return": "off",
        "semi": [
            "error",
            "always"
        ]
    }
};