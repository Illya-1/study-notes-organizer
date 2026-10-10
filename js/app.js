const notes = [
    {
        subject: "Математичний аналіз",
        topic: "Інтеграл. Повторення",
        pages: 2,
        examSoon: false,
        id: 0
    },
    {
        subject: "Математичний аналіз",
        topic: "Кратні інтеграли. Частина 1",
        pages: 5,
        examSoon: false,
        id: 1
    },
    // {
    //     subject: "Математичний аналіз",
    //     topic: "Кратні інтеграли. Паттерни розв'язання",
    //     pages: 4,
    //     examSoon: true,
    //     id: 2
    // },
    // {
    //     subject: "Веб-програмування",
    //     topic: "Flexbox",
    //     pages: 4,
    //     examSoon: true,
    //     id: 3
    // },
    // {
    //     subject: "Веб-програмування",
    //     topic: "Grid та його використання",
    //     pages: 3,
    //     examSoon: true,
    //     id: 4
    // },
    // {
    //     subject: "Веб-програмування",
    //     topic: "Адаптивна верстка та Media Queries",
    //     pages: 1,
    //     examSoon: false,
    //     id: 5
    // }
];

// === REACT ===

//Компонент який відповідає за рендер списку карток, а також за логіку зміни елементів в цьому списку
function App(){
    const [notesList, setNotesList] = React.useState(notes);

    function togglExamSoon(id){
        setNotesList(
            notesList.map(note => 
                note.id === id ? 
                {...note, examSoon: !note.examSoon} : 
                note
            )
        )
    }

    return (
        <>{
            notesList.map((note) => (
                    <NoteSummary
                        key={note.id}
                        onToggle={togglExamSoon}
                        subject={note.subject}
                        topic={note.topic}
                        pages={note.pages}
                        examSoon={note.examSoon}
                        id={note.id}
                    />
                )
            )
        }</>
    );
}

//Компонент який відповідає за рендер картки
function NoteSummary({subject, topic, pages, id, examSoon, onToggle}){
    const altText = `Конспект: ${topic}`
    const imgSrc = "https://placehold.co/600x400"

    return (
    <article className={`card ${examSoon ? "exam-soon" : ""}`}>
        <h3>{topic}</h3>
        <img src={imgSrc} alt={altText}/>
        <footer>
            <p>{subject}</p>
            <label>
                <input 
                    type="checkbox" 
                    name="examSoon" 
                    checked={examSoon} 
                    onChange={() => onToggle(id)}
                />
                Скоро іспит
            </label>
        </footer>
    </article>
    );
}

ReactDOM.createRoot(document.getElementById("notes-list")).render(<App />);