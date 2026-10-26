const notes = [
    {
        subject: "Математичний аналіз",
        topic: "Інтеграл. Повторення",
        pages: 2,
        learned: false,
        id: 0
    },
    {
        subject: "Математичний аналіз",
        topic: "Кратні інтеграли. Частина 1",
        pages: 5,
        learned: false,
        id: 1
    }
];

// === FORM ===

const form = document.querySelector("#note-form");
form.addEventListener("submit", (event)=>{
    event.preventDefault();
    
    const subjectValue = form.elements.subject.value;
    const topicValue = form.elements.topic.value.trim();
    const pagesValue = Number(form.elements.pages.value);
    const isLearned = form.elements.learned.checked;

    const newNote = {
        subject: subjectValue,
        topic: topicValue,
        pages: pagesValue,
        learned: isLearned,
        id: Date.now(),
    };

    window.addNoteToReact(newNote);
    form.reset();
})

// === FORM ===

// Додаткова валідація поля topic: підміна стандартного системного повідомлення
// браузера на зрозумілу українську підказку при невідповідності патерну
const topicInput = document.querySelector('#form-topic-input');
topicInput.addEventListener("input", (event) =>{
    if(topicInput.validity.patternMismatch){
        topicInput.setCustomValidity('Тема має містити щонайменше 3 символи');
    }
    else{
        topicInput.setCustomValidity('');
    }
})

// === REACT ===

//Компонент який відповідає за рендер списку карток, а також за логіку зміни елементів в цьому списку
function App(){
    const [notesList, setNotesList] = React.useState(notes);

    window.addNoteToReact = (newNote) => {
        setNotesList((prevNotes) => [...prevNotes, newNote]);
    };

    function togglLearned(id){
        setNotesList(
            notesList.map(note => 
                note.id === id ? 
                {...note, learned: !note.learned} : 
                note
            )
        )
    }

    return (
        <>{
            notesList.map((note) => (
                    <NoteSummary
                        key={note.id}
                        onToggle={togglLearned}
                        subject={note.subject}
                        topic={note.topic}
                        pages={note.pages}
                        learned={note.learned}
                        id={note.id}
                    />
                )
            )
        }</>
    );
}

//Компонент який відповідає за рендер картки
function NoteSummary({subject, topic, pages, id, learned, onToggle}){
    const altText = `Конспект: ${topic}`
    const imgSrc = "https://placehold.co/600x400"

    return (
    <article className={`card ${learned ? "learned" : ""}`}>
        <h3>{topic}</h3>
        <img src={imgSrc} alt={altText}/>
        <footer>
            <p>{subject}</p>
            <label>
                <input 
                    type="checkbox" 
                    name="learned" 
                    checked={learned} 
                    onChange={() => onToggle(id)}
                />
                Вивчено
            </label>
        </footer>
    </article>
    );
}

ReactDOM.createRoot(document.getElementById("notes-list")).render(<App />);