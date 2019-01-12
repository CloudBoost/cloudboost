module.exports = {
    "parserOptions": {
        "ecmaVersion": 8,
        "sourceType": "module"
    },
    "extends": ["eslint:recommended", "airbnb-base"],
    "env": {
        "node": true,
        "es6": true
    },
    "rules": {
        "for-direction": "off",
        "getter-return": "off",
        "no-underscore-dangle": "off",
        "no-restricted-globals": "off",
        "no-throw-literal": "off",
        "no-plusplus": "off",
        "no-useless-escape": "off",
        "max-len": ["error", { "code": 140, "ignoreRegExpLiterals": true }],
        "semi": [
            "error",
            "always"
        ]
    }
};