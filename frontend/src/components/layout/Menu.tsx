import type {MenuProps} from "antd";
import {HomeOutlined, UserOutlined, VideoCameraOutlined,} from "@ant-design/icons";

type MenuItem = Required<MenuProps>["items"][number];

export const getMenuItems = (
    navigate: (path: string) => void,
    isAdmin: boolean,
    message: (msg: string) => void,
    closeDrawer?: () => void
): MenuItem[] => {
    const navigateAndClose = (path: string) => {
        navigate(path);
        if (closeDrawer) closeDrawer();
    };

    const handleClick = (key: string) => {
        if (key === "/new-movie" && !isAdmin) {
            message("Access denied: Admins only");
            return;
        }
        navigateAndClose(key);
    };

    return [
        {
            key: "/home",
            icon: <HomeOutlined/>,
            label: "Home",
            onClick: () => handleClick("/home"),
        },
        {
            key: "/movies",
            icon: <VideoCameraOutlined/>,
            label: "Movies List",
            onClick: () => handleClick("/movies"),
        },
        {
            key: "/account",
            icon: <UserOutlined/>,
            label: "Account",
            onClick: () => handleClick("/account"),
        },
    ];
};
