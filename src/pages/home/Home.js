import { Button, Input, Spin, Typography } from "antd";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition";
import { AudioOutlined } from "@ant-design/icons";
import { capitalizeString } from "../../handler/utils";
const { TextArea } = Input;

export default function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");

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
    stopRecognition()
    await axios
      .post("http://localhost:5000/api", {
        input: input, // Use the provided input instead of value state
      })
      .then(function (response) {
        setValue("");
        setData([...data, response.data]);
        setLoading(false);
   
      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
        
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

  return (
    <div className="px-20">
      <div className="h-[90vh] overflow-scroll">
        {data && data.length === 0 && (
          <div className="flex items-center justify-center w-full h-full">
            <Typography className="text-gray-300 text-2xl">
              No messages yet
            </Typography>
          </div>
        )}
        {data.map((item, index) => (
          <div className="bg-gray-600 rounded-lg p-4 my-4" key={index}>
            <Typography className="text-white">
              {capitalizeString(item?.input || "")}
            </Typography>
            <Typography className="text-gray-300">
              {parseContent(item?.message || "")}
            </Typography>
          </div>
        ))}
      </div>

      <div className="flex items-center mt-4">
        <TextArea
        rows={1}
          size="large"
          placeholder="Type here..."
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
        <Button size="large" onClick={() =>{
            stopRecognition()
            setValue("")
        }}>
          Reset
        </Button>
      </div>
    </div>
  );
}
