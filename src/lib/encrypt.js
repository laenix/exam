function encrypt(params) {
    var exam_public_key = `-----BEGIN PUBLIC KEY-----
        MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDLyh5Lb/5TprGvS9yFCcpCYnb
        0FuSyY3+TPbJI7Pv3+u4eFoqGGN46qyFOVLhUuFRttMfoA8h8yrdYCssLi93baoB
        yTMYf5/KVlviLKXWd3TDOJdeSX4d+qLUp/WK0ckm2VaJuY5vW0x5x6WbZ8MSxwTD
        MqNNMgVUdOgD3MIScwIDAQAB
        -----END PUBLIC KEY-----`;
    var encrypt = new JSEncrypt();
    encrypt.setPublicKey(exam_public_key);
    var encrypted = encrypt.encrypt(params);
    return encrypted
}