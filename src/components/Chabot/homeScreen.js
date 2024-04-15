import './homeScreen.css'
import {useState, useRef, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
// import chatbot_logo from '/chatbot_logo.jpg'

const HomeScreen = () =>{
    const [messages, setMessages] = useState(
        localStorage.getItem("messages") === null?
        []:
        JSON.parse(localStorage.getItem("messages"))
    );
    const [inputText, setInputText] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [recordingBlocked, setRecordingBlocked] = useState(true);
    const [recordingSupported, setRecordingSupported] = useState(true);
    const scrollRef = useRef(null);

    const handleInputChange = (e) => {
        setInputText(e.target.value);
    };

    const {sendMessage:sendWsMessage,sendJsonMessage,lastMessage,lastJsonMessage,readyState,getWebSocket} = useWebSocket('ws://localhost:8000/ws/web/', {
        onOpen: () => console.log('opened'),
        shouldReconnect: (closeEvent) => true,
        onMessage: (e) => {
          messageFromBot(e)
          console.log(e)
        }
    });

    const sendMessage = (userText, botText) =>{
        console.log(userText, botText);
        const oldMessages = [...messages];
        const newMessage = [{
            sender: 'user',
            text: userText
        }];
        const updatedMessages = [...oldMessages, ...newMessage];
        setMessages(updatedMessages);
        localStorage.setItem("messages", JSON.stringify(updatedMessages));
        setInputText("");
        sendWsMessage(JSON.stringify({
            text:botText
        }))
    }

    const messageFromBot = (message) =>{
        console.log("heres", message);
        if(message.data==="connected"){
            return
        }

        const data = message.data;
        let allMessages = [...messages];
        
        if(allMessages[allMessages.length-1].sender === "bot"){
            allMessages[allMessages.length-1].text += data;
        }else{
            allMessages.push({
                sender:"bot",
                text: data
            })
        }
        setMessages(allMessages);
        localStorage.setItem("messages", JSON.stringify(allMessages));
        setTimeout(() => {
            scrollRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "end",
            });
          }, 500);
    }


    const startSpeechRecognition = () => {
        // const recognition = new window.webkitSpeechRecognition();
        var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const recognition = new SpeechRecognition();
          setRecordingBlocked(false);
          setIsRecording(true);
      
          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            sendMessage(transcript, transcript);
            setIsRecording(false);
          };
      
          recognition.onend = () => {
            setIsRecording(false);
          };
      
          recognition.start();
        })
        .catch((err) => {
          console.error(`you got an error: ${err}`);
          setIsRecording(false);
          setRecordingBlocked(true);
        });      
         
        } else {
          setRecordingSupported(false);
          setIsRecording(true);
          console.log("SpeechRecognition API not supported in this browser"); 
        }
      };

      useEffect(() => {
        if (messages.length) {
          setTimeout(() => {
            scrollRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "end",
            });
          }, 500);
        }
      }, [messages.length,]);

      useEffect(() => {
        setTimeout(() =>{
          setIsRecording(false)
          setRecordingSupported(true);
          setRecordingBlocked(false);
        }, 3000)
      }, [recordingSupported, recordingBlocked])
    
    return (
        <div className='body'>
           <header>
            <image src = "/images/chatbot_logo.jpg" alt= "logo" width="10px"/>
                Hello, How may i help you?
            </header> 
            <div className='chat-container'>
                {messages.map((message, index) =>{
                    console.log("HEREEE",message);
                    return (
                    <>
                        {message.text && 
                            <div className={`message ${message.sender === "bot"?"bot":"user"}` } key = {index}>
                                {message.text}

                            </div>}
                    </>
                    )
                })}
                <div ref={scrollRef}></div>
            </div>
            <div className='footer'>
                <form onSubmit= {(e) => {e.preventDefault();sendMessage(inputText, inputText)}}>
                    <input 
                    type="text"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={handleInputChange}
                    />
                    {inputText === ""
                    ?(
                    <>
                        <div className='submit-button' onClick={() => {
                            startSpeechRecognition();
                        }}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                        >
                        <path
                          d="M10.2851 12.6316C12.0325 12.6316 13.443 11.2211 13.443 9.47368V3.15789C13.443 1.41053 12.0325 0 10.2851 0C8.53777 0 7.12725 1.41053 7.12725 3.15789V9.47368C7.12725 11.2211 8.53777 12.6316 10.2851 12.6316ZM16.5062 9.47368C15.9904 9.47368 15.5588 9.85263 15.4746 10.3684C15.043 12.8421 12.8851 14.7368 10.2851 14.7368C7.68514 14.7368 5.52725 12.8421 5.09567 10.3684C5.05855 10.1208 4.93422 9.89463 4.74508 9.73058C4.55595 9.56654 4.31445 9.47543 4.06409 9.47368C3.42198 9.47368 2.91672 10.0421 3.01146 10.6737C3.52725 13.8316 6.05356 16.3053 9.23251 16.7579V18.9474C9.23251 19.5263 9.70619 20 10.2851 20C10.8641 20 11.3378 19.5263 11.3378 18.9474V16.7579C12.8868 16.5366 14.3249 15.8275 15.4436 14.7334C16.5622 13.6394 17.3031 12.2174 17.5588 10.6737C17.6641 10.0421 17.1483 9.47368 16.5062 9.47368Z"
                          fill="white"
                        />
                      </svg>
                    </div>

                    {isRecording && recordingSupported === true? (
                        <p className="recording-started-text">Recording...</p>
                    ) : (
                        recordingSupported ? 
                        (recordingBlocked? 
                            (<p className="recording-started-text"> Please give recording permission</p>): 
                            (<></>)) 
                        : (<p className="recording-started-text">Recording is not supported on this browser.</p>)
                    )}
                    </>
                    ):(
                    <div  className='submit-button' onClick={() =>{ sendMessage(inputText, inputText)}}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            // viewBox="0 0 18 18"
                            fill="none"
                            className="submit-button-icon"
                            >
                            <path
                                d="M1.61688 8.66113L1.01288 3.22413C0.839883 1.66813 2.44188 0.525129 3.85688 1.19613L15.8009 6.85413C17.3259 7.57613 17.3259 9.74613 15.8009 10.4681L3.85688 16.1271C2.44188 16.7971 0.839883 15.6551 1.01288 14.0991L1.61688 8.66113ZM1.61688 8.66113H8.61688"
                                stroke="white"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                            </svg>
                      </div>
                    )
                    }
                </form>

            </div>
        </div>
    )
}

export default HomeScreen;