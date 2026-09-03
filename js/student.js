const studentInfoSection =
    document.getElementById("studentInfoSection");

const complaintSection =
    document.getElementById("complaintSection");

const successSection =
    document.getElementById("successSection");


const studentInfoForm =
    document.getElementById("studentInfoForm");

const complaintForm =
    document.getElementById("complaintForm");


const studentNameInput =
    document.getElementById("studentName");

const rollNumberInput =
    document.getElementById("rollNumber");

const labRoomInput =
    document.getElementById("labRoom");

const systemNumberInput =
    document.getElementById("systemNumber");

const complaintInput =
    document.getElementById("complaint");

const wordCounter =
    document.getElementById("wordCounter");


const displayStudentName =
    document.getElementById("displayStudentName");

const changeStudentButton =
    document.getElementById("changeStudentButton");

const newComplaintButton =
    document.getElementById("newComplaintButton");


let student = {
    name: "",
    rollNumber: ""
};


/* ------------------------------
   WORD COUNT
-------------------------------- */

function countWords(text) {

    return text
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0)
        .length;
}


function updateWordCounter() {

    const words = countWords(
        complaintInput.value
    );

    wordCounter.textContent =
        `${words} / 100 words`;

    if (words > 100) {

        wordCounter.style.color = "#dc2626";

    } else {

        wordCounter.style.color = "#64748b";
    }
}


complaintInput.addEventListener(
    "input",
    updateWordCounter
);


/* ------------------------------
   STUDENT INFORMATION
-------------------------------- */

studentInfoForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const name =
            studentNameInput.value.trim();

        const roll =
            rollNumberInput.value.trim();


        if (!name || !roll) {

            alert(
                "Please enter your name and board roll number."
            );

            return;
        }


        student.name = name;
        student.rollNumber = roll;


        displayStudentName.textContent =
            `${student.name} • ${student.rollNumber}`;


        studentInfoSection.classList.add("hidden");

        complaintSection.classList.remove("hidden");

    }
);


/* ------------------------------
   CHANGE STUDENT
-------------------------------- */

changeStudentButton.addEventListener(
    "click",
    function () {

        complaintSection.classList.add("hidden");

        studentInfoSection.classList.remove("hidden");

    }
);


/* ------------------------------
   COMPLAINT SUBMISSION
-------------------------------- */

complaintForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const labRoom =
            labRoomInput.value;

        const systemNumber =
            Number(systemNumberInput.value);

        const complaint =
            complaintInput.value.trim();

        if (
            !["103", "115", "121"].includes(labRoom)
        ) {

            alert(
                "Please select a valid lab room."
            );

            return;
        }


        if (
            !Number.isInteger(systemNumber) ||
            systemNumber < 1 ||
            systemNumber > 99
        ) {

            alert(
                "System number must be a positive two-digit number."
            );

            return;
        }


        const wordCount =
            countWords(complaint);


        if (
            !complaint ||
            wordCount === 0
        ) {

            alert(
                "Please enter your complaint."
            );

            return;
        }


        if (wordCount > 100) {

            alert(
                "Complaint cannot contain more than 100 words."
            );

            return;
        }


        const submitButton =
            document.getElementById(
                "submitButton"
            );


        submitButton.disabled = true;

        submitButton.innerHTML =
            "Submitting...";


        try {

            const { error } =
                await supabaseClient
                    .from("complaints")
                    .insert({

                        student_name:
                            student.name,

                        board_roll_number:
                            student.rollNumber,

                        lab_room_number:
                            Number(labRoom),

                        system_number:
                            systemNumber,

                        complaint:
                            complaint,

                        status:
                            "OPEN"

                    });


            if (error) {

                console.error(error);

                throw error;
            }


            document.getElementById(
                "successLab"
            ).textContent = labRoom;


            document.getElementById(
                "successSystem"
            ).textContent =
                String(systemNumber);


            complaintSection.classList.add(
                "hidden"
            );

            successSection.classList.remove(
                "hidden"
            );


            complaintForm.reset();

            updateWordCounter();


        } catch (error) {

            alert(
                "Unable to submit the complaint. Please try again."
            );

            console.log(error);

        } finally {

            submitButton.disabled = false;

            submitButton.innerHTML =
                "Submit Complaint <span>→</span>";
        }

    }
);


/* ------------------------------
   NEW COMPLAINT
-------------------------------- */

newComplaintButton.addEventListener(
    "click",
    function () {

        successSection.classList.add(
            "hidden"
        );

        complaintSection.classList.remove(
            "hidden"
        );

        labRoomInput.focus();

    }
);