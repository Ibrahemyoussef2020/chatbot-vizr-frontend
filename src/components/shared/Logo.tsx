import { Link } from "react-router-dom"
import Typography from "@mui/material/Typography"
const Logo = () => {
    return (
        <div >
            <Link to="/" className="flex mr-auto items-center gap-2">
                <img src="/robot.png" alt="Vizr chatbot" className="!w-10 !h-10 object-contain" />
                <Typography variant="h6" component="div" sx={{ display: { md: 'block', sm: 'none', mr: 'auto', fontWeight: 700, textShadow: '2px 2px 20px #000' } }}>
                    <span className="text-[20px] text-white">Vizr</span><span className="text-sm text-cyan-300"> AI</span>
                </Typography>
            </Link>
        </div>
    )
}

export default Logo
