import { Outlet } from "react-router-dom"

const Chat = () => {
    return (
        <div>
            <h1>Chat Page Layout</h1>

            <Outlet />
        </div>
    )
}

export default Chat