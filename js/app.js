console.log("js script підключено");
const notes = [
    {
        "subject": "Математичний аналіз",
        "pages": 2,
        "examSoon": false
    },
    {
        "subject": "Веб-програмування",
        "pages": 4,
        "examSoon": true
    },
    {
        "subject": "Веб-програмування",
        "pages": 3,
        "examSoon": true
    },
    {
        "subject": "Математичний аналіз",
        "pages": 4,
        "examSoon": true
    },
    {
        "subject": "Математичний аналіз",
        "pages": 5,
        "examSoon": false
    },
    {
        "subject": "Веб-програмування",
        "pages": 1,
        "examSoon": true
    },
]

//Виводить на екран скільки конспектів існує з кожного предмету. Якщо скоро екзамен з предмета, поруч з кількістю буде вивидене попередження
function processSubjectsArray(notes){
    const notesInSubjects = {};
    for(const item of notes){
        if(!notesInSubjects[item.subject]){
            notesInSubjects[item.subject] = {
                "count": 0,
                "examSoon": item.examSoon
            }
        }
        notesInSubjects[item.subject].count += 1;
    }

    for(const key in notesInSubjects){
        const value = notesInSubjects[key];
        console.log(`${key}: ${value.count} ${value.examSoon ? "Скоро екзамен!!!" : ""}`);
    }
}

processSubjectsArray(notes)

//Рахує кількість сторінок яку треба читати за день щоб встигнути прочитати всі сторінку конспекту до екзамену
const pagesPerDay = (pages, daysLeft) => Math.ceil(pages / daysLeft);
const pages = 10;
const daysLeft = 3;
console.log(`Щоб встигнути перечитати конспекти до екзамена потрібно читати ${pagesPerDay(pages, daysLeft)} сторінок на день`)