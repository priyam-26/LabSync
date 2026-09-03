const loginPage =
    document.getElementById("loginPage");

const dashboardPage =
    document.getElementById("dashboardPage");


const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");


const complaintsTableBody =
    document.getElementById(
        "complaintsTableBody"
    );

const emptyState =
    document.getElementById("emptyState");


const searchInput =
    document.getElementById("searchInput");

const labFilter =
    document.getElementById("labFilter");

const statusFilter =
    document.getElementById("statusFilter");


const saveButton =
    document.getElementById("saveButton");

const logoutButton =
    document.getElementById("logoutButton");


const totalCount =
    document.getElementById("totalCount");

const openCount =
    document.getElementById("openCount");

const fixedCount =
    document.getElementById("fixedCount");

const resultCount =
    document.getElementById("resultCount");


/*
    Local working copy.

    Changes are made here first.
    They are sent to Supabase only
    when Save Changes is clicked.
*/

let complaints = [];

let originalComplaints = [];

let hasUnsavedChanges = false;


/* ------------------------------
   INITIALIZATION
-------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


async function initialize() {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    if (session) {

        await showDashboard(
            session
        );

    } else {

        showLogin();
    }


    supabaseClient.auth.onAuthStateChange(
        async (event, session) => {

            if (
                event === "SIGNED_IN" &&
                session
            ) {

                await showDashboard(
                    session
                );

            }

            if (
                event === "SIGNED_OUT"
            ) {

                showLogin();
            }

        }
    );
}


/* ------------------------------
   LOGIN
-------------------------------- */

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document.getElementById(
                "adminEmail"
            ).value.trim();

        const password =
            document.getElementById(
                "adminPassword"
            ).value;


        const loginButton =
            document.getElementById(
                "loginButton"
            );


        loginError.classList.add(
            "hidden"
        );


        loginButton.disabled = true;

        loginButton.textContent =
            "Signing in...";


        const {
            error
        } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });


        if (error) {

            loginError.textContent =
                "Invalid email or password.";

            loginError.classList.remove(
                "hidden"
            );

        }


        loginButton.disabled = false;

        loginButton.textContent =
            "Login";

    }
);


/* ------------------------------
   SHOW LOGIN
-------------------------------- */

function showLogin() {

    loginPage.classList.remove(
        "hidden"
    );

    dashboardPage.classList.add(
        "hidden"
    );
}


/* ------------------------------
   SHOW DASHBOARD
-------------------------------- */

async function showDashboard(
    session
) {

    loginPage.classList.add(
        "hidden"
    );

    dashboardPage.classList.remove(
        "hidden"
    );


    document.getElementById(
        "adminEmailDisplay"
    ).textContent =
        session.user.email;


    await loadComplaints();
}


/* ------------------------------
   LOAD COMPLAINTS
-------------------------------- */

async function loadComplaints() {

    const {
        data,
        error
    } = await supabaseClient
        .from("complaints")
        .select("*")
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(error);

        alert(
            "Unable to load complaints."
        );

        return;
    }


    complaints =
        data.map(item => ({
            ...item
        }));


    originalComplaints =
        JSON.parse(
            JSON.stringify(complaints)
        );


    setUnsavedChanges(false);

    renderTable();
}


/* ------------------------------
   DATE FORMAT
-------------------------------- */

function formatDateTime(
    dateString
) {

    const date =
        new Date(dateString);


    const time =
        date.toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }
        );


    const day =
        String(
            date.getDate()
        ).padStart(2, "0");


    const month =
        date.toLocaleString(
            "en-IN",
            {
                month: "short"
            }
        );


    const year =
        date.getFullYear();


    return `${time} • ${day} ${month} ${year}`;
}


/* ------------------------------
   RENDER TABLE
-------------------------------- */

function renderTable() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedLab =
        labFilter.value;


    const selectedStatus =
        statusFilter.value;


    const filtered =
        complaints.filter(
            complaint => {

                const matchesSearch =
                    !search ||
                    complaint.student_name
                        .toLowerCase()
                        .includes(search) ||
                    complaint.board_roll_number
                        .toLowerCase()
                        .includes(search) ||
                    complaint.complaint
                        .toLowerCase()
                        .includes(search);


                const matchesLab =
                    selectedLab === "all" ||
                    String(
                        complaint.lab_room_number
                    ) === selectedLab;


                const matchesStatus =
                    selectedStatus === "all" ||
                    complaint.status === selectedStatus;


                return (
                    matchesSearch &&
                    matchesLab &&
                    matchesStatus
                );
            }
        );


    complaintsTableBody.innerHTML =
        "";


    resultCount.textContent =
        `${filtered.length} complaint${filtered.length === 1 ? "" : "s"}`;


    if (!filtered.length) {

        emptyState.classList.remove(
            "hidden"
        );

    } else {

        emptyState.classList.add(
            "hidden"
        );
    }


    filtered.forEach(
        complaint => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    <div class="student-name">
                        ${escapeHTML(
                            complaint.student_name
                        )}
                    </div>
                </td>

                <td>
                    <span class="roll">
                        ${escapeHTML(
                            complaint.board_roll_number
                        )}
                    </span>
                </td>

                <td>
                    <span class="date">
                        ${formatDateTime(
                            complaint.created_at
                        )}
                    </span>
                </td>

                <td>
                    <span class="lab-badge">
                        ${complaint.lab_room_number}
                    </span>
                </td>

                <td>
                    <span class="system-badge">
                        ${complaint.system_number}
                    </span>
                </td>

                <td>
                    <div class="complaint-text">
                        ${escapeHTML(
                            complaint.complaint
                        )}
                    </div>
                </td>

                <td>

                    <span class="
                        status-badge
                        ${
                            complaint.status === "FIXED"
                                ? "status-fixed"
                                : "status-open"
                        }
                    ">
                        ${
                            complaint.status === "FIXED"
                                ? "Fixed"
                                : "Open"
                        }
                    </span>

                </td>

                <td>

                    <div class="action-buttons">

                        ${
                            complaint.status === "OPEN"

                            ? `
                                <button
                                    class="action-button fix-button"
                                    data-action="fix"
                                    data-id="${complaint.id}"
                                >
                                    Mark Fixed
                                </button>
                            `

                            : `
                                <button
                                    class="action-button undo-button"
                                    data-action="undo"
                                    data-id="${complaint.id}"
                                >
                                    Reopen
                                </button>
                            `
                        }

                        <button
                            class="action-button delete-button"
                            data-action="delete"
                            data-id="${complaint.id}"
                        >
                            Delete
                        </button>

                    </div>

                </td>
            `;


            complaintsTableBody.appendChild(
                row
            );

        }
    );


    updateStats();
}


/* ------------------------------
   ESCAPE HTML
-------------------------------- */

function escapeHTML(
    value
) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* ------------------------------
   STATISTICS
-------------------------------- */

function updateStats() {

    const total =
        complaints.length;


    const open =
        complaints.filter(
            c => c.status === "OPEN"
        ).length;


    const fixed =
        complaints.filter(
            c => c.status === "FIXED"
        ).length;


    totalCount.textContent =
        total;

    openCount.textContent =
        open;

    fixedCount.textContent =
        fixed;
}


/* ------------------------------
   TABLE ACTIONS
-------------------------------- */

complaintsTableBody.addEventListener(
    "click",
    async function (event) {

        const button =
            event.target.closest(
                "button"
            );


        if (!button) {
            return;
        }


        const action =
            button.dataset.action;


        const id =
            Number(
                button.dataset.id
            );


        if (action === "fix") {

            changeStatus(
                id,
                "FIXED"
            );

        }


        if (action === "undo") {

            changeStatus(
                id,
                "OPEN"
            );

        }


        if (action === "delete") {

            await deleteComplaint(
                id
            );

        }

    }
);


/* ------------------------------
   MARK FIXED / REOPEN
-------------------------------- */

function changeStatus(
    id,
    status
) {

    const complaint =
        complaints.find(
            item => item.id === id
        );


    if (!complaint) {
        return;
    }


    complaint.status =
        status;


    complaint.fixed_at =
        status === "FIXED"
            ? new Date().toISOString()
            : null;


    setUnsavedChanges(true);

    renderTable();
}


/* ------------------------------
   DELETE
-------------------------------- */

async function deleteComplaint(
    id
) {

    const complaint =
        complaints.find(
            item => item.id === id
        );


    if (!complaint) {
        return;
    }


    const confirmed =
        await showConfirmation(
            "Delete Complaint",
            "Are you sure you want to delete this complaint? This change will be applied when you press Save Changes.",
            "Delete"
        );


    if (!confirmed) {
        return;
    }


    complaints =
        complaints.filter(
            item => item.id !== id
        );


    setUnsavedChanges(true);

    renderTable();
}


/* ------------------------------
   SAVE
-------------------------------- */

saveButton.addEventListener(
    "click",
    saveChanges
);


async function saveChanges() {

    if (!hasUnsavedChanges) {
        return;
    }


    saveButton.disabled = true;

    saveButton.textContent =
        "Saving...";


    try {

        /*
            Find deleted complaints.
        */

        const deleted =
            originalComplaints.filter(
                original =>
                    !complaints.some(
                        current =>
                            current.id === original.id
                    )
            );


        /*
            Delete them.
        */

        for (
            const complaint of deleted
        ) {

            const {
                error
            } = await supabaseClient
                .from("complaints")
                .delete()
                .eq(
                    "id",
                    complaint.id
                );


            if (error) {
                throw error;
            }
        }


        /*
            Update existing complaints.
        */

        for (
            const complaint of complaints
        ) {

            const original =
                originalComplaints.find(
                    item =>
                        item.id === complaint.id
                );


            if (!original) {
                continue;
            }


            const changed =
                original.status !==
                    complaint.status ||
                original.fixed_at !==
                    complaint.fixed_at;


            if (!changed) {
                continue;
            }


            const {
                error
            } = await supabaseClient
                .from("complaints")
                .update({

                    status:
                        complaint.status,

                    fixed_at:
                        complaint.fixed_at

                })
                .eq(
                    "id",
                    complaint.id
                );


            if (error) {
                throw error;
            }
        }


        /*
            Refresh from database so
            the local state exactly matches
            the database.
        */

        await loadComplaints();


    } catch (error) {

        console.error(error);

        alert(
            "Some changes could not be saved. Please try again."
        );

    } finally {

        saveButton.disabled = false;

        saveButton.textContent =
            "Save Changes";
    }
}


/* ------------------------------
   UNSAVED STATE
-------------------------------- */

function setUnsavedChanges(
    value
) {

    hasUnsavedChanges =
        value;


    if (value) {

        saveButton.classList.add(
            "unsaved"
        );

    } else {

        saveButton.classList.remove(
            "unsaved"
        );
    }
}


/* ------------------------------
   FILTER EVENTS
-------------------------------- */

searchInput.addEventListener(
    "input",
    renderTable
);


labFilter.addEventListener(
    "change",
    renderTable
);


statusFilter.addEventListener(
    "change",
    renderTable
);


/* ------------------------------
   LOGOUT
-------------------------------- */

logoutButton.addEventListener(
    "click",
    async function () {

        if (hasUnsavedChanges) {

            const confirmed =
                await showConfirmation(
                    "Unsaved Changes",
                    "You have unsaved changes. Logging out now will discard them.",
                    "Logout"
                );


            if (!confirmed) {
                return;
            }
        }


        await supabaseClient.auth.signOut();

    }
);


/* ------------------------------
   UNSAVED CHANGES WHEN LEAVING
-------------------------------- */

window.addEventListener(
    "beforeunload",
    function (event) {

        if (!hasUnsavedChanges) {
            return;
        }


        event.preventDefault();

        event.returnValue = "";

    }
);


/*
    Intercept internal navigation
    when possible.
*/

document.addEventListener(
    "click",
    function (event) {

        const link =
            event.target.closest(
                "a"
            );


        if (
            !link ||
            !hasUnsavedChanges
        ) {
            return;
        }


        const href =
            link.getAttribute("href");


        if (
            !href ||
            href.startsWith("#") ||
            href.startsWith("javascript:")
        ) {
            return;
        }


        event.preventDefault();


        showUnsavedModal(
            () => {

                window.location.href =
                    href;

            }
        );

    }
);


/* ------------------------------
   CONFIRMATION MODAL
-------------------------------- */

let modalResolver = null;


function showConfirmation(
    title,
    message,
    confirmText
) {

    return new Promise(
        resolve => {

            modalResolver =
                resolve;


            document.getElementById(
                "modalTitle"
            ).textContent =
                title;


            document.getElementById(
                "modalMessage"
            ).textContent =
                message;


            document.getElementById(
                "modalConfirm"
            ).textContent =
                confirmText;


            document.getElementById(
                "confirmModal"
            ).classList.remove(
                "hidden"
            );

        }
    );
}


document.getElementById(
    "modalCancel"
).addEventListener(
    "click",
    function () {

        closeConfirmation(false);

    }
);


document.getElementById(
    "modalConfirm"
).addEventListener(
    "click",
    function () {

        closeConfirmation(true);

    }
);


function closeConfirmation(
    result
) {

    document.getElementById(
        "confirmModal"
    ).classList.add(
        "hidden"
    );


    if (modalResolver) {

        modalResolver(result);

        modalResolver = null;
    }
}


/* ------------------------------
   UNSAVED MODAL
-------------------------------- */

let unsavedLeaveAction = null;


function showUnsavedModal(
    leaveAction
) {

    unsavedLeaveAction =
        leaveAction;


    document.getElementById(
        "unsavedModal"
    ).classList.remove(
        "hidden"
    );
}


document.getElementById(
    "stayButton"
).addEventListener(
    "click",
    function () {

        document.getElementById(
            "unsavedModal"
        ).classList.add(
            "hidden"
        );

        unsavedLeaveAction = null;

    }
);


document.getElementById(
    "leaveButton"
).addEventListener(
    "click",
    function () {

        document.getElementById(
            "unsavedModal"
        ).classList.add(
            "hidden"
        );


        const action =
            unsavedLeaveAction;


        unsavedLeaveAction = null;


        if (action) {
            action();
        }

    }
);

