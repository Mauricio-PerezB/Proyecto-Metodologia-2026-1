export const SidebarItem = ({label, destination, icon}) => {
    return (
        <>
            <li>
                <a href={destination} className="text-blue-100 hover:text-white hover:bg-blue-900 rounded-lg transition-colors block">
                    <button className="is-drawer-close:tooltip is-drawer-close:tooltip-right w-full text-left" 
                        data-tip={label}
                    >
                        <div className="flex flex-row align-middle items-center-safe p-2">
                        {icon()}
                        <span className="ml-2 is-drawer-close:hidden">{label}</span>
                        </div>
                    </button>
                </a>
            </li>
        </>
    );
}

export default SidebarItem;