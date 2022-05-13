/**
 * Filename: ce-helpers.js
 * Description: Utility functions used by Code Exchange index pages.
 * Version: 1.0.2
 */
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

/**
 * scans the document for inputs that need the "copy" feature 
 * then assigns it and performs the copy action
 */
const handleCopyToClipboard = () => {

    const copyToclipboard = (input) => {
        input.select();
        if (!navigator.clipboard) {
            // older browsers fallback to this
            try {
                document.execCommand('copy');
                return true
            } catch (error) {
                return false
            }

        } else {
            return navigator.clipboard
                .writeText(input.value)
                .then(() => true)
                .catch(() => false);
        }
    }
    const buttonHTML = `<button title="copy">
                    <svg role="img" aria-hidden="false" width="100%" height="100%" viewBox="0 0 20 20" aria-labelledby="CopyIcon">
                        <path fill="currentColor" fill-rule="evenodd"
                            d="M13.469 2.5c.63 0 1.15.48 1.212 1.094l.007.125-.001 1.593h1.407c.73 0 1.331.558 1.4 1.271l.006.136v9.375c0 .776-.63 1.406-1.406 1.406H6.719c-.777 0-1.407-.63-1.407-1.406v-1.407H3.719c-.631 0-1.15-.48-1.213-1.094L2.5 13.47v-9.75c0-.631.48-1.15 1.094-1.213L3.72 2.5h9.75zm2.625 3.75H6.719a.469.469 0 00-.469.469v9.375c0 .259.21.468.469.468h9.375c.259 0 .468-.21.468-.468V6.719a.469.469 0 00-.468-.469zm-2.625-2.813h-9.75a.281.281 0 00-.274.217l-.007.065v9.75c0 .133.092.244.216.274l.065.007 1.593-.001v-7.03c0-.731.558-1.332 1.271-1.4l.136-.006 7.031-.001V3.719a.281.281 0 00-.217-.274l-.064-.007z">
                        </path>
                    </svg>
                </button>`;
    const wrapperClass = ".copy-input-wrapper";
    const copyButtons = document.querySelectorAll(wrapperClass);
    copyButtons.forEach(el => {
        el.insertAdjacentHTML("beforeend", buttonHTML);
        el.addEventListener('click', async (e) => {
            e.preventDefault();
            const wrapper = e.target.closest(wrapperClass);
            const input = wrapper.querySelector("input");
            const copySuccess = await copyToclipboard(input);
            if (copySuccess) {
                wrapper.classList.add('copied');
                setTimeout(() => {
                    wrapper.classList.remove('copied');
                }, 5000);
            } else {
                console.error("Failed to copy to clipboard");
            }
        })
    })
}