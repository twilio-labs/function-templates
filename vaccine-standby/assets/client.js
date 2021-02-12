let phone_number;
let accessToken;
let flowSid;

// This code will replace the content of any <span class="function-root"></span> with the base path of the URL
const baseUrl = new URL(location.href);
baseUrl.pathname = baseUrl
    .pathname
    .replace(/\/index\.html$/, '');
delete baseUrl.hash;
delete baseUrl.search;
const fullUrl = baseUrl
    .href
    .substr(0, baseUrl.href.length - 1);
const functionRoots = document.querySelectorAll('span.function-root');

functionRoots.forEach(element => {
    element.innerText = fullUrl
})

let request = new XMLHttpRequest();
request.open('GET', fullUrl + '/return-config');
request.send();
request.onload = () => {
    const response = JSON.parse(request.response);
    phone_number = response.phone_number;

    // Grab the phone number being used and display it to help the user test their app
    const phone_number_elements = $('.phone-number');
    phone_number_elements.html(phone_number);
}

function setup(e) {
e.preventDefault();
$('#deploy-flow .btn').addClass('loading');
$('.loader').show();

fetch('/setup').then(response => {
    checkStudioFlow();
})
.catch(err => {
    console.log("An error ocurred creating Studio Flow", err);
    $('#deploy-flow .btn').removeClass('loading');
    $('.loader').hide();
});
}

function checkStudioFlow() {
fetch('/check-existing-flow')
    .then(response => response.text())
    .then(sid => {
    $('#deploy-flow .btn').removeClass('loading');
    $('.loader').hide();
    if (sid === 'none') {
        $('#deploy-flow').show();
        console.log('no flow')
    } else {
        flowSid = sid;
        $('#flow-deployed').show();
        $('#deploy-flow').hide();
        $('#open-studio').attr('href', `https://www.twilio.com/console/studio/flows/${sid}`);
        $('.execution-logs-link').attr('href', `https://www.twilio.com/console/studio/flows/${sid}/executions`);
        console.log('flow exists');
    }
    });
};

function getStudioData(token) {
    $('#test-standby-list').show();
    clearInterval(getStudioExecutions);
    setInterval(getStudioExecutions, 3000, flowSid, token);
}

async function login(e) {
    e.preventDefault();

    let passwordInput = $('#password-input').val();
    fetch('/login', {
        method: "POST",
        headers: {
        Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({'password': passwordInput})
    })
    .then(response => {
        if(!response.ok) {
            throw Error(response.statusText);
        }

        return response;
    })
    .then(response => response.json())
    .then(r => {
        getStudioData(r.token);
    })
    .catch(err => console.log(err));
}

function getStudioExecutions(sid, token) {
    console.log('Pulling from Studio...');
    const tbody = $('#residents-table-body');
    fetch(`/get-studio-executions?sid=${sid}&token=${token}`)
        .then(response => response.json())
        .then(data => {
        if (data.length > 0) {
            let rows = "";
            for (var i = 0; i < data.length; i++) {
                if(data[i]) {
                    let tr = "<tr>";
                    tr += "<td>"+data[i].name+"</td>";
                    tr += "<td>"+data[i].phone_number+"</td>";
                    tr += "<td>"+data[i].age+"</td>";
                    tr += "<td>"+data[i].zip_code+"</td>";
                    tr += "<td>"+data[i].essential_worker+"</td>";
                    tr += "<td>"+data[i].work_from_home+"</td>";
                    tr += "<td>"+data[i].long_term_care+"</td>";
                    tr += "<td>"+data[i].congregate_setting+"</td>";
                    tr += "<td>"+data[i].health_condition+"</td>";
                    tr += "<td>"+data[i].notification_preference+"</td>";
                    tr += "<td>"+data[i].language_preference+"</td>";
                    tr += "</tr>";

                    rows = rows.concat(tr);
                }
            }
            tbody.html(rows);
    } else {
        tbody.html(`<tr class="table-placeholder"><td colspan="11">No records yet. Send a text message to <strong class="phone-number">${phone_number}</strong> to begin.</td></tr>`)
    }
    })
    .catch(err => console.log(err));
}

checkStudioFlow();