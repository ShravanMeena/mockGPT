import { Button, Input, Select, Spin, Typography, Tabs } from "antd";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { AudioOutlined } from "@ant-design/icons";
import { capitalizeString } from "../../handler/utils";
import character from "../../assets/characters/char_one.mp4";
import chat_error from "../../assets/characters/chat_error.mp4";

const { TextArea } = Input;
const { Option } = Select;

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [audioSrc, setAudioSrc] = useState("");
  const [error, setError] = useState(false);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const handleResult = (transcript) => {
    setValue(transcript);
  };

  const {
    finalTranscript,
    interimTranscript,
    startLoading,
    startRecognition,
    stopRecognition,
  } = useSpeechRecognition(handleResult);

  const submitHandler = async (input) => {
    setLoading(true);
    setError(false);
    setValue("");
    stopRecognition();
    await axios
      .post("http://localhost:5000/common-api", {
        input,
      })
      .then(function (response) {
        setData([...data, response.data]);
        setLoading(false);
      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
        setError(true);
      });
  };

  useEffect(() => {
    setValue(finalTranscript + interimTranscript);
  }, [finalTranscript, interimTranscript]);

  const parseContent = (text) => {
    const parts = text.split(/(```[\s\S]*?```)/);
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        return (
          <div key={index} className="bg-black p-4 my-4 rounded-md">
            <pre className="text-sm text-white">
              <code>{part.slice(3, -3).trim()}</code>
            </pre>
          </div>
        );
      }
      return <p key={index}>{part.trim()}</p>;
    });
  };

  const fetchQuestion = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/generate-question",
        { topic }
      );

      speakHandler(response.data.question);
    } catch (error) {
      console.error("Error fetching question:", error);
      setLoading(false);
      setError(true);
    }
  };

  //   const speakHandler = async (text) => {
  //     setLoading(true);
  //     await axios
  //       .post(
  //         `https://api.elevenlabs.io/v1/text-to-speech/29vD33N1CtxCmqQRPOHJ`,
  //         {
  //           text: `Born and raised in the charming south,
  //         I can add a touch of sweet southern hospitality
  //         to your audiobooks and podcasts`,
  //           model_id: "eleven_multilingual_v2",
  //           voice_settings: {
  //             stability: 0.5,
  //             similarity_boost: 0.5,
  //           },
  //         },
  //         {
  //           headers: {
  //             "x-api-key": "551ce03db8ee1fbfbc2779a717aa98ce",
  //             Accept: "audio/mpeg",
  //             "Content-Type": "application/json",
  //             responseType: 'blob'
  //           },
  //         }
  //       )
  //       .then(function (response) {
  //         console.log(response.data, "response");
  //         setLoading(false);

  //         const audioUrl = URL.createObjectURL(response.data);
  //         setAudioSrc(audioUrl);
  //       })
  //       .catch(function (error) {
  //         console.log(error);
  //         setLoading(false);
  //       });
  //   };

  const speakHandler = async (text) => {
    setLoading(true);
    const apiKey = "aace954694a7e1b8fdc3c1dda7381643";
    const apiUrl =
      "https://api.elevenlabs.io/v1/text-to-speech/29vD33N1CtxCmqQRPOHJ/stream";
    const payload = {
      text:
        text ||
        `Born and raised in the charming south, 
        I can add a touch of sweet southern hospitality 
        to your audiobooks and podcasts`,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
      },
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
      setError(true)
        throw new Error("Failed to fetch audio");

      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioSrc(audioUrl);
      setLoading(false);
      setQuestion(text);
    } catch (error) {
      setQuestion(text);
      console.error("Error generating audio:", error);
      setLoading(false);
      setError(true)
    }
  };

  const [selectedTab, setSelectedTab] = useState("1");
  const onChange = (key) => {
    setSelectedTab(key);
  };

  const items = [
    {
      key: "1",
      label: (
        <Button type={selectedTab === "1" ? "primary" : "dashed"}>
          TalkGPT
        </Button>
      ),
      children: (
        <>
          <div className="h-[80vh] overflow-scroll">
            {data && data.length === 0 && (
              <div className="flex items-center justify-center w-full h-full">
                <Typography className="text-gray-300 text-2xl">
                  No messages yet
                </Typography>
              </div>
            )}
            {data.map((item, index) => (
              <div className="bg-gray-600 rounded-lg p-4 my-4" key={index}>
                <Typography className="text-white block mb-4">
                  {capitalizeString(item?.input || "")}
                </Typography>
                <div className="p-4 bg-gray-800 rounded-xl">
                  <Typography className="text-gray-400 ">
                    {parseContent(item?.message || "")}
                  </Typography>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center mt-4">
            <TextArea
              rows={1}
              size="large"
              placeholder="Ask anything here...(Type or speak📢...)"
              onChange={(e) => setValue(e.target.value)}
              value={value}
              onKeyUp={(ev) => {
                if (ev.key === "Enter") {
                  submitHandler(value);
                }
              }}
            />
            <Button
              loading={loading}
              size="large"
              className="ml-4"
              type="primary"
              onClick={() => submitHandler(value)}
            >
              Submit
            </Button>
            <Button
              loading={loading}
              disabled={startLoading}
              size="large"
              type={startLoading ? "primary" : "default"}
              className="mx-4"
              onClick={startRecognition}
            >
              {startLoading ? (
                <Spin />
              ) : (
                <Typography.Text className="text-xl">
                  <AudioOutlined />
                </Typography.Text>
              )}
            </Button>
            <Button
              size="large"
              onClick={() => {
                setValue("");
                stopRecognition();
              }}
            >
              Reset
            </Button>
          </div>
        </>
      ),
    },
    {
      key: "2",
      label: (
        <Button type={selectedTab === "2" ? "primary" : "dashed"}>
          MockGPT
        </Button>
      ),
      children: (
        <>
          <div className="my-4 flex items-center justify-center">
            <Select
              placeholder="Select a topic"
              onChange={(value) => setTopic(value)}
              style={{ width: 200 }}
              className="mr-4"
            >
              <Option value="javascript">JavaScript</Option>
              <Option value="react">React</Option>
              <Option value="node">Node.js</Option>
              <Option value="python">Python</Option>
              <Option value="java">Java</Option>
            </Select>
            <Button
              onClick={fetchQuestion}
              disabled={!topic}
              loading={loading}
              type="primary"
            >
              Generate Question
            </Button>
          </div>

          {question && (
            <div className="my-4">
              <Typography.Text className="text-white block text-center">
                {capitalizeString(question)}
              </Typography.Text>

              {audioSrc && (
                <audio
                  ref={audioRef}
                  className="ml-[-1000px] h-4"
                  autoPlay
                  controls
                  src={audioSrc}
                  onEnded={() => {
                    if (videoRef.current) {
                      videoRef.current.pause();
                    }
                  }}
                />
              )}

              {audioSrc && (
                <div className="flex items-center justify-center w-full">
                  <video
                    ref={videoRef}
                    loop
                    src={character}
                    width="750"
                    height="500"
                    controls={false}
                    autoPlay
                    muted={true}
                    playsInline
                  ></video>
                </div>
              )}
            
              <div className="flex items-center justify-center mt-4">
                <Button
                  loading={loading}
                  disabled={startLoading}
                  size="large"
                  type={startLoading ? "primary" : "default"}
                  onClick={startRecognition}
                >
                  {startLoading ? (
                    <Spin />
                  ) : (
                    <Typography.Text className="text-xl">
                      <AudioOutlined /> Start Answer
                    </Typography.Text>
                  )}
                </Button>

                {startLoading && (
                  <Button
                    size="large"
                    className="ml-4"
                    onClick={() => {
                      stopRecognition();
                      setValue("");
                    }}
                  >
                    Stop Answering
                  </Button>
                )}
              </div>
              {value && (
                <div className="p-6 bg-black">
                  <Typography.Text className="text-white">
                    {capitalizeString(value)}
                  </Typography.Text>
                </div>
              )}
            </div>
          )}

              {error &&  <div className="flex flex-col items-center justify-center w-full">
                  <video
                    loop
                    src={chat_error}
                    width="750"
                    height="500"
                    controls={false}
                    autoPlay
                    muted={true}
                    playsInline
                  ></video>

                  <h1 className="text-3xl text-red-500">ERROR: Audio Quota Exceeded</h1>
                </div>}

        </>
      ),
    },
  ];

  return (
    <div className="px-20">
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    </div>
  );
}
