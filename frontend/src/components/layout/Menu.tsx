import type { MenuProps } from "antd";
import { BarChartOutlined, HomeOutlined, UserOutlined, VideoCameraOutlined, DashboardOutlined } from "@ant-design/icons";

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
        (!isAdmin ? {
            key: "/home",
            icon: <HomeOutlined />,
            label: "Home",
            onClick: () => handleClick("/home"),
        } : null),
        {
            key: "/movies",
            icon: <VideoCameraOutlined />,
            label: "Movies List",
            onClick: () => handleClick("/movies"),
        },
        (isAdmin ? {
            key: "/admin",
            icon: <DashboardOutlined />,
            label: "Admin Panel",
            onClick: () => handleClick("/admin"),
        } : null),
        {
            key: "/account",
            icon: <UserOutlined />,
            label: "Account",
            onClick: () => handleClick("/account"),
        },
        (!isAdmin ? {
            key: "/statistics",
            icon: <BarChartOutlined />,
            label: "Statistics",
            onClick: () => handleClick("/statistics"),
        } : null),
    ].filter(Boolean) as MenuItem[];
};
