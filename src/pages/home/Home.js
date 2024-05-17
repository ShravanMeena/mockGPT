import { Button, Divider, Input, Typography } from "antd";
import React, { useState } from "react";
import axios from "axios";
import Paragraph from "antd/es/skeleton/Paragraph";

export default function Home() {
  const [value, setValue] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const submitHandler = async () => {
    setLoading(true);
    await axios
      .post("http://localhost:5000/api", {
        input: value,
      })
      .then(function (response) {
        setData([...data, response.data]);
        setLoading(false);
        setValue("")
      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
      });
  };

  // Function to parse the input text and split into paragraphs and code snippets
  const parseContent = (text) => {
    const parts = text.split(/(```[\s\S]*?```)/);
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        return (
          <div key={index} className="bg-gray-500 p-4 my-4 rounded-md">
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
        {data.map((item, index) => {
          return (
            <div className="bg-gray-600 rounded-lg p-4 my-4" key={index}>
              <Typography className="text-white">{parseContent(item?.input||"")}</Typography>
              <Typography className="text-gray-300">{parseContent(item?.message||"")}</Typography>
            </div>
          );
        })}
      </div>
      <div className="flex items-center ">
        <Input
          size="large"
          placeholder="Type here..."
          onChange={(e) => setValue(e.target.value)}
          value={value}
          onKeyUp={(ev) => {
            console.log(ev);
            if (ev.key === "Enter") {
                submitHandler();
            }
          }}
        />
        <Button
          loading={loading}
          size="large"
          className="ml-4"
          type="primary"
          onClick={() => submitHandler()}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
