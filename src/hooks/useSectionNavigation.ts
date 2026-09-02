const useSectionNavigation = () => {
    const navigateToSection = (sectionId: string) => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", `#${sectionId}`);
    };

    return { navigateToSection };
};

export default useSectionNavigation;
