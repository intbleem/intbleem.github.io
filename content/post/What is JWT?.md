---
title: What is JWT?
slug: jwt
tags: [JWT]
category: Tech
date: 2021-03-12
status: publish
---
## What is JWT?

> JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed. JWTs can be signed using a secret (with the HMAC algorithm) or a public/private key pair using RSA or ECDSA.
> Although JWTs can be encrypted to also provide secrecy between parties, we will focus on signed tokens. Signed tokens can verify the integrity of the claims contained within it, while encrypted tokens hide those claims from other parties. When tokens are signed using public/private key pairs, the signature also certifies that only the party holding the private key is the one that signed it.

## Application scenarios



### Single Sign On
This is the most common scenario to use JWT. In a multi-system service architecture, after a user logged in to one system at first time, there is no need to log in repeatedly when using other systems.

### Authorization
After a user logged in, every subsequent request contains JWT. When the JWT is verified, the user is allowed to access the resource he should access.

## Components of JWT

JWT consists of three parts: Header, Payload, Signature, and they are connected with a dot.

- The Header consists of two parts: the type of token and the signing algorithm being used, e.g. :

```json
{
    'alg': "HS256",
    'typ': "JWT"
}
```

- The Payload is actually a place to store valid information which has three types of claims. 

Registered claims: Predefined claims which are not mandatory but recommended. Such as `iss(issuer)` and `exp(expiration time)`

Public claims: They can be defined at will.

Private claims: These are the custom claims created to share information between parties that agree on using them and are neither registered or public claims.

-  The Signature is a digital signature to prevent data from being tampered.

## How is JWT generated

JWT is divided into three parts. How do these three parts come together to form a completed JWT?

- The Header is encoded by base64 to get the first part.
- The Payload is encoded by base64 to get the second part.
- Through the algorithm in Header with a secret sign that encoded Header and encoded Payload and Connected with dot.

Tips: Jwt is not encrypted, so it's better not to store some sensitive information directly in JWT.

## Workflow of JWT

After successful login for the first time, the user will get a JWT. This JWT is the certificate for the user to interact with the server, that is, the server uses this token to determine which user the requester is.
When the user wants to access the resources on the server, the token was sent, which is usually placed in `authorization`, using `bearer` schema.
For example:
```
Authorization: Bearer token
```

## What are the advantages over traditional session authentication?

### Session authentication
Because HTTP is a stateless protocol, we provide our user name and password for authentication when we first access it. Then, in the second visit, we still need to carry out a user authentication. Because according to the HTTP protocol, we don't know who the originator of the request is, in order to identify which user initiated the request, we can only save a copy of the user's information on the server, and then pass the same information to the user, so that the user can save it in cookies. In the next request, you only need to carry the information in the cookies. According to the submitted cookies, the server can determine which user it is. This is the traditional authentication based on session.

### Problems in session based authentication
Session: after each user has been authenticated by our application, our application needs to make a record on the server to facilitate the authentication of the next request. Generally speaking, the session is saved in memory. With the increase of authenticated users, the cost of the server will increase significantly.

Scalability: after user authentication, the server makes authentication records. If the authentication records are saved in memory, it means that the next request of the user must be on this server, so that the authorized resources can be obtained. This also means that the expansion ability of the application is limited.

CSRF: because user identification is based on cookie, if cookie is intercepted, users will be vulnerable to cross site request forgery attack.

### What are the advantages of JWT based authentication

- Tokens are stored in the client, completely stateless and scalable.
- Security: token is different from a cookie. Each request will send a token. Since no cookie is sent, it can also prevent CSRF attacks.

> reference from https://jwt.io/introduction