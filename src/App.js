import { useState, useEffect, useRef } from 'react'
import assistantAvatar from './assistant_Avatar.jpg'
import userAvatar from './user_Avatar.png'
import TextareaAutosize from 'react-textarea-autosize'

const App = () => {
  const inputRef = useRef(null)
  const inputValueRef = useRef("")
  const [feedScrollTop, setFeedScrollTop] = useState(0);
  const feedRef = useRef(null)


  const [value, setValue] = useState(inputValueRef.current)
  const [message, setMessage] = useState(null)
  const [previousChats, setPreviousChats] = useState([])
  const [currentTitle, setCurrentTitle] = useState({})

//get res from user's input
const getMessages = async () => {
  const options = {
    method: "POST",
    body: JSON.stringify({
      message: value
    }),
    headers: {
      "Content-Type": "application/json"
    }
  }
  try {
    const response  = await fetch('http://localhost:8000/completions', options)
    const data = await response.json()
    console.log(data)
    if (data && data.choices && data.choices.length > 0) {
      setMessage({ role: data.choices[0].message.role, content: data.choices[0].message.content })
    } else {
      console.error('Error: no choices found in data')
      setMessage({ role: 'assistant', content: 'Lỗi' })
    }
    setTimeout(() => {
      inputValueRef.current = ""
      setValue(inputValueRef.current)
    }, 0)
  } catch (error) {
    console.error(error);
    setMessage({ role: 'assistant', content: 'Lỗi' })
  }
}

  useEffect(() => {
    console.log(currentTitle, value, message)
    if (!currentTitle && value && message) {
      setCurrentTitle(value)
    }
    
    if (currentTitle && value && message) {
      setFeedScrollTop(feedRef.current.scrollTop)
      setPreviousChats(prevChats => (
        [...prevChats, 
          {
            title: currentTitle,
            role: "user",
            content: value
          }, 
          {
            title: currentTitle,
            role: message.role,
            content: message.content
          }
        ]
      ))
    }
    
  }, [message, currentTitle])

// jump to the end of responses
  useEffect(() => {
    if (previousChats.filter(previousChats => previousChats.title === currentTitle) && feedRef.current) {
      feedRef.current.scrollTop = feedScrollTop + feedRef.current.scrollHeight;
    }
  }, [previousChats, currentTitle, feedScrollTop])


// copy text
  const copyToClipboard = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }

  const TypingEffect = ({ message }) => {
    const [displayMessage, setDisplayMessage] = useState('')
  
    useEffect(() => {
      let timer = setInterval(() => {
        if (displayMessage.length < message.length) {
          setDisplayMessage(displayMessage + message[displayMessage.length])
        } else {
          clearInterval(timer)
        }
      }, 500)
  
      return () => {
        clearInterval(timer)
      }
    }, [message])
  
    return <span>{displayMessage}</span>
  }


  console.log(previousChats)

  const currentChat = previousChats.filter(previousChats => previousChats.title === currentTitle)
  const uniqueTitles = Array.from(new Set(previousChats.map(previousChats => previousChats.title)))
  console.log(uniqueTitles)

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setValue(inputValueRef.current);
      getMessages(); // call getMessages directly
    }
  }

  return (
    <div className="app">
      <link rel="stylesheet" 
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,600,0..0.5,-50..200" />
      <section className="main">
        {!currentTitle}
        <ul className="feed" ref={feedRef}>
          {currentChat?.map((chatMessage, index) => (
            <li key={index}>
            <div className="avatar">
              <div className='message-container'> 
                <img src={chatMessage.role === 'user' ? userAvatar : assistantAvatar} alt={chatMessage.role} />
              </div>
              <p className={`role ${chatMessage.role}`}>
                {chatMessage.role === 'user' ? 'You' : 'NiT Chatbot'}
              </p>
            </div>
            <div className={`message ${chatMessage.role}`}>
              <p>{chatMessage.content}</p>
            </div>
            <button className="copy-button copy-button--custom" 
                    title='Copy'
                    onClick={() => copyToClipboard(chatMessage.content)}>
              <span>&#128203;</span>
            </button>
          </li>
          ))}
        </ul>
        <div className="bottom-section">
          <div className="input-container">
            <TextareaAutosize className='textarea' ref={inputRef} value={value} 
                    onChange={(e) => { inputValueRef.current = e.target.value; 
                    setValue(e.target.value) }} onKeyDown={handleKeyDown} placeholder='Nhập câu hỏi ở đây nháaa'/>
            <a href='#' className="submit" onClick={getMessages}>&#8593;</a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;