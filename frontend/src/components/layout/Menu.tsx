import type {MenuProps} from "antd";
import {
    HomeOutlined,
    VideoCameraOutlined,
    UserOutlined,
} from "@ant-design/icons";

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

    const items: MenuItem[] = [
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

    if (isAdmin) {
        items.push(
            {
                key: "/new-movie",
                icon: <VideoCameraOutlined/>,
                label: "New Movie",
                onClick: () => handleClick("/new-movie"),
            },
            {
                key: "/users",
                icon: <UserOutlined/>,
                label: "Users List",
                onClick: () => handleClick("/users"),
            }
        );
    }

    return items;
};
