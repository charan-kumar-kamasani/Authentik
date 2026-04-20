const { StandardCheckoutClient, Env } = require('pg-sdk-node');
const { StandardCheckoutPayRequest } = require('pg-sdk-node');
const request = StandardCheckoutPayRequest.builder()
    .merchantOrderId("TEST123456")
    .amount(100)
    .redirectUrl("https://localhost")
    .build();
console.log(JSON.stringify(request, null, 2));
