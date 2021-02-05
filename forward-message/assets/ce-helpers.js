"use strict";

const inputPrependBaseURL = () => {
    // Prepend the value of any <input class="function-root"> with the base path of the URL
    const baseUrl = new URL(location.href);
    baseUrl.pathname = baseUrl
        .pathname
        .replace(/\/.*\.html$/, "");
    delete baseUrl.hash;
    delete baseUrl.search;
    const fullUrl = baseUrl
          .href
          .substr(0, baseUrl.href.length - 1);
    const functionRoots = document.querySelectorAll("input.function-root");

    functionRoots.forEach(element => {
        element.value = fullUrl + element.value;
    });
}
