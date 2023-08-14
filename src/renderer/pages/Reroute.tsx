/* eslint-disable */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
export default function Reroute() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/')
  }, []);
  return (
    <>
    </>
  );
}
