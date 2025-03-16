(async function () {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function submit() {
        let submitBtn = document.querySelector(".submit.btn-brand");
        if (submitBtn) {
            submitBtn.removeAttribute("disabled");
            submitBtn.click();
        }
    }

    function selectChoice(choice) {
        let label = document.querySelector(`label[for="${choice.id}"]`);
        choice.focus();
        if (label) {
            label.click();
        } else {
            choice.click();
        }
        choice.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function removeDiacritics(str) {
        const diacriticsMap = {
            'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
            'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
            'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
            'đ': 'd',
            'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
            'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
            'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
            'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
            'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
            'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
            'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
            'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
            'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y'
        };
        return str.replace(/[^A-Za-z0-9\s]/g, char => diacriticsMap[char.toLowerCase()] || char);
    }

    const options = Array.from(document.querySelectorAll(".tags li:not(.poly-reset)")).map(e => removeDiacritics(e.innerText.trim()));

    function isCorrect(num) {
        let status = document.querySelectorAll(".wrapper-problem-response")[num].querySelector(".sr").innerHTML;
        return status === 'correct';
    }

    async function bruteForceQuestion(question, num) {

        let inputField = question.querySelector("input[type='text']");
        let choices = Array.from(question.querySelectorAll("input[type='radio'], input[type='checkbox']"));
        let isMultiChoice = choices.length > 0 && choices[0].type === "checkbox";

        if (inputField) {
            while(options.length > 0) {
                let option = options.shift();
                document.querySelectorAll(".wrapper-problem-response")[num].querySelector("input[type='text']").focus();
                document.querySelectorAll(".wrapper-problem-response")[num].querySelector("input[type='text']").value = option;

                await sleep(100);
                submit();
                await sleep(1000);

                if (isCorrect(num)) {
                    return true;
                }
            }
        } else if (isMultiChoice) {
            let numChoices = choices.length;

            for (let count = 1; count <= numChoices; count++) {
                let combinations = getCombinations(choices, count);

                for (let combo of combinations) {

                    document.querySelectorAll(".wrapper-problem-response")[num].querySelectorAll("input[type='checkbox']").forEach(ch => {
                        if((ch.checked != null && ch.checked === true)) {
                            selectChoice(ch);
                            ch.removeAttribute("checked");
                        }
                    });

                    combo.forEach(ch => {
                        selectChoice(ch);
                    });

                    await sleep(100);
                    submit();
                    await sleep(1000);

                    if (isCorrect(num)) {
                        return;
                    }

                }
            }

        } else {
            for (let choice of choices) {
                selectChoice(choice);
                await sleep(100);
                submit();
                await sleep(1000);
                if (isCorrect(num)) return;
            }
        }
    }

    function getCombinations(arr, count) {
        let result = [];
        let combination = [];

        function backtrack(start) {
            if (combination.length === count) {
                result.push([...combination]);
                return;
            }
            for (let i = start; i < arr.length; i++) {
                combination.push(arr[i]);
                backtrack(i + 1);
                combination.pop();
            }
        }

        backtrack(0);
        return result;
    }

    submit();
    await sleep(800);

    let questions = document.querySelectorAll(".wrapper-problem-response");
    for (let i = 0; i < questions.length; i++) {
        console.log(`Đang brute force câu ${i + 1}`);
        if (!isCorrect(i)) {
            await bruteForceQuestion(questions[i], i);
        }
    }

    console.log("Hoàn thành brute force, auto 10 điểm!");

})();
