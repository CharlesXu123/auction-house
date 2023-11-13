import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { getAddressRole } from "../utils/interact";

const AccessControlButton = () => {
  const Navigate = useNavigate();

  const [role, setRole] = useState("user");

  useEffect(() => {
    const getRole = async () => {
      try {
        const role = await getAddressRole();
        console.log(role);
        setRole(role);
      } catch (error) {
        console.log(error);
      }
    };

    getRole();
  }, []);

  const handleClick = (event) => {
    event.preventDefault();

    Navigate(`/${role}`);
  };

  return (
    <div>
      {role === "user" ? (
        <></>
      ) : (
        <Button sx={{ mr: 1 }} onClick={handleClick}>
          {role}
        </Button>
      )}
    </div>
  );
};

export default AccessControlButton;
