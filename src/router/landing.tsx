import { Home, About, Contact, PolicyTerms, Pricing } from "@/pages";
import { Landing } from "@/layouts";

const landingRouter = [
    {
        path: "/",
        element: <Landing />,
        children: [
            {
                path: "pricing",
                element: <Pricing />,
            },
            {
                index: true,
                element: <Home />,
            },
            {
                path: "about",
                element: <About />,
            },
            {
                path: "contact",
                element: <Contact />,
            },
            {
                path: "policy-terms",
                element: <PolicyTerms />,
            },
        ],
    },
];

export default landingRouter;
