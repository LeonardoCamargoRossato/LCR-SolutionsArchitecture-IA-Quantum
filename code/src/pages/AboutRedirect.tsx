import { useEffect } from 'react';import { useNavigate } from 'react-router-dom'
export function AboutRedirect(){const nav=useNavigate();useEffect(()=>{nav('/',{replace:true});window.setTimeout(()=>document.getElementById('about')?.scrollIntoView({behavior:'smooth'}),100)},[nav]);return null}
