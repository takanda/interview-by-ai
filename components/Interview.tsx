"use client"

import React, { useState, ReactNode, useEffect, } from "react"
import { useMutation } from "@tanstack/react-query"
import { ThumbsUp } from "lucide-react"
import Image from "next/image"
import axios from "axios"
import ScrollArea from "./ui/Scroll"
import Card from "./ui/Card"

const INTERVIEWEE_NAME = "田中 太郎";

interface History {
  id: number;
  speaker: string;
  transcript: string;
}

const createNewHistory = (speaker: string, history: History[] | []): History[] => {
  if (history.length === 0) {
    return [{
      id: 1,
      speaker: speaker,
      transcript: "",
    }]
  } else {
    return [
      ...history,
      {
        id: history.length + 1,
        speaker: speaker,
        transcript: "",
      }
    ]
  }
};

// Main InterviewApp component
export default function InterviewApp() {
  const [timeLeft, setTimeLeft] = useState(1800);
  const [isActive, setIsActive] = useState(false);
  const [aiRecommendations, setAIRecommendations] = useState<string[] | []>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [history, setHistory] = useState<History[] | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_GAS_ENDPOINT as string;
  const mutation = useMutation({
    mutationFn: (reqData: {name: string, input: string}) => {
      return axios.post(apiUrl, JSON.stringify(reqData));
    },
    onSuccess: (data) => {
      if (data.data.response) {
        const res: string[] = data.data.response.split(",");
        const newAIRecommendations = [...aiRecommendations];
        for (let i = 0; i < res.length; i++) {
          newAIRecommendations.push(res[i]);
        }
        setAIRecommendations(newAIRecommendations);
      }
    },
    onError: (err) => {
      console.error(err);
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const recognition = new webkitSpeechRecognition();
      recognition.lang = "ja-JP";
      recognition.continuous = true;
      recognition.interimResults = true;
      setRecognition(recognition);
    }
  }, []);

  useEffect(() => {
    if (!recognition) return;
    let newHistory: History[] | [] = [];
    if (history) {
      newHistory = [...history];
    }
    if (isRecording) {
      newHistory = createNewHistory("interviewee", newHistory);
      setHistory(newHistory);
      setIsActive(true);
      recognition.start();
    } else {
      setIsActive(false);
      recognition.stop();
    }
  }, [isRecording]);


  useEffect(() => {
    if (!recognition) return;
    recognition.onresult = (event) => {
      const results = event.results;
      for (let i = event.resultIndex; i < results.length; i++) {
        if (history && results[i].isFinal) {
          let newHistory = [...history];
          if (newHistory[newHistory.length - 1].speaker === "interviewer") {
            newHistory.push({
              id: newHistory.length,
              speaker: "interviewee",
              transcript: "",
            });
          }
          newHistory[newHistory.length - 1].transcript += results[i][0].transcript;
          setHistory(newHistory);
          mutation.mutate({name: INTERVIEWEE_NAME, input: results[i][0].transcript});
        }
      }
    };
  }, [history]);

  useEffect(() => {
    let timer = undefined;

    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const clickHandler = (recommendation: string) => {
    if (history) {
      const newHistory = [...history];
      newHistory.push({
        id: newHistory.length,
        speaker: "interviewer",
        transcript: recommendation,
      })
      setHistory(newHistory);
    }
    setAIRecommendations([]);
    mutation.mutate({name: "interviewer", input: recommendation});
  };

  return (
    <div className="min-h-[1200px] flex flex-col md:flex-row h-screen bg-gray-100 overflow-y-auto p-4">
      <div className="h-4/5 md:w-2/3 flex flex-col space-y-4">
        <Card className="flex-1 mb-4">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-black">インタビュー</h2>
            <div className="text-2xl font-bold mt-2 text-black">{formatTime(timeLeft)}</div>
          </div>
          <div className="p-4">
            <div className="bg-black rounded-lg mb-4 relative" style={{ height: "300px" }}>
              <video className="w-full h-full rounded-lg object-cover" src="" />
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <button
                  onClick={() => setIsRecording(prev => !prev)}
                  className="bg-red-600 text-white rounded px-2 py-1"
                >
                  {isRecording ? "録音停止" : "録音開始"}
                </button>
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg p-4">
              <h3 className="font-bold mb-2 text-black">インタビュイー情報</h3>
              <p className="text-black">名前: {INTERVIEWEE_NAME}</p>
              <p className="text-black">年齢: 25歳</p>
            </div>
          </div>
        </Card>
        <Card className="flex-1">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-black">AIレコメンデーション</h2>
          </div>
          <ScrollArea className="p-4 h-64 overflow-y-auto">
            {aiRecommendations.map((recommendation, index) => (
              <div key={index} className="flex items-center mb-4 bg-blue-50 p-3 rounded-lg">
                <button onClick={() => clickHandler(recommendation)}>
                  <ThumbsUp className="h-5 w-5 text-blue-500 mr-3" />
                  <p className="text-black">{recommendation}</p>
                </button>
              </div>
            ))}
          </ScrollArea>
        </Card>
      </div>
      <div className="h-4/5 md:w-1/3 px-4">
        <Card className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-black">インタビュー文字起こし</h2>
          </div>
          <ScrollArea className="flex-grow p-4 overflow-y-auto">
            {history ? (history.map((entry) => (
              <div key={entry.id} className="mb-4">
                <div className="flex items-center mb-2">
                  <Image
                    width="30"
                    height="30"
                    alt={entry.speaker === "interviewer" ? "interviewer" : "interviewee"}
                    src={entry.speaker === "interviewer" ? "/images/interviewer-avatar.png" : "/images/interviewee-avatar.png"}
                  />
                  <span className="ml-2 font-semibold text-black">
                    {entry.speaker === "interviewer" ? "インタビュアー" : "インタビュイー"}
                  </span>
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="text-black">{entry.transcript}</p>
                </div>
              </div>
            ))) : (<></>)}
          </ScrollArea>
        </Card>
      </div>
    </div>

  );
}
