"use client";

import image from "/public/image.png";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [queueData, setQueueData] = useState<{
    array: string;
    age: string;
    gender: string;
  }>();
  const [value, setValue] = useState("");
  const [gender, setGender] = useState("male");
  const [ownGender, setOwnGender] = useState("female");

  useEffect(() => {
    const socket = io("ws://localhost:7000");

    socket.on("connect", () => {
      console.log("connected");
      setSocket(socket);
    });

    socket.on("queue", (data) => console.log(data));
    socket.on("queue-joining", (data) => {
      console.log(data);
      setQueueData(data);
    });

    socket.on("joining", (data) => console.log(data));
    socket.on("join-call", (data) => {
      console.log(data);
    });
    socket.on("message", (data) => console.log(data));

    return () => {
      socket.disconnect();
      socket.off("queue");
    };
  }, []);

  const joinQueue = () => {
    const data = {
      user: {
        id: value,
        name: `Miron#${value}`,
        gender: ownGender,
      },
      age: null,
      gender,
    };

    socket?.emit("join-queue", data);
  };

  const leaveQueue = () => {
    const data = {
      ...queueData,
      userId: value,
    };

    socket?.emit("leave-queue", data);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const getImageBlobFromFile = async (file: File) => {
    try {
      const blob = new Blob([file]);
      return blob;
    } catch (error) {
      console.error("Ошибка при загрузке изображения:", error);
      throw error;
    }
  };

  const handleFileInputChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const blob = await getImageBlobFromFile(file);
        console.log("Изображение в формате Blob:", blob);
        const data = {
          message: null,
          roomId: "clud68abj0001p7dklthlk7qm",
          to_id: "clubpg11g0000rbmu0tjkcozv",
          from_id: "clubpgld40001rbmuozn33jui",
          image: blob,
        };
        socket?.emit("room-message", data);
      } catch (error) {
        console.error("Ошибка:", error);
      }
    }
  };

  return (
    <div className="flex items-center gap-5">
      <button onClick={joinQueue}>JOIN</button>
      <button onClick={leaveQueue}>LEAVE</button>
      <input value={value} onChange={onChange} />
      <input type="text" readOnly value={gender} />
      <button onClick={() => setGender(gender === "male" ? "female" : "male")}>
        CHANGE GENDER
      </button>
      <input type="text" readOnly value={ownGender} />
      <button
        onClick={() => setOwnGender(ownGender === "male" ? "female" : "male")}
      >
        CHANGE GENDER
      </button>
      <input type="file" onChange={handleFileInputChange} />
    </div>
  );
}
