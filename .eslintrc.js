/* eslint-env node */
module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
        "react-app",
        "react-app/jest",
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true,
        },
        "ecmaVersion": 12,
        "sourceType": "module",
    },
    "plugins": [
        "react",
        "@typescript-eslint",
    ],
    "rules": {
        "array-bracket-spacing": "warn",
        "comma-dangle": ["warn", "always-multiline"],
        "indent": ["warn", 4, { "ignoredNodes": ["JSXElement *"] }],
        "key-spacing": "warn",
        "object-curly-spacing": ["warn", "always"],
        "quotes": "warn",
        "semi": "warn",
        "react/jsx-indent": ["warn", 2],
        "@typescript-eslint/explicit-member-accessibility": "warn",
        "@typescript-eslint/type-annotation-spacing": "warn",
    },
};
