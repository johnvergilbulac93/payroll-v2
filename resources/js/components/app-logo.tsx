import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name, description } = usePage().props;

    return (
        <>
            <div className="flex aspect-square h-11 w-11 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="!h-8 !w-8 !shrink-0 !fill-current text-white dark:text-black" />
            </div>
            {/* <div className="flex aspect-square h-20 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="h-10 w-10 fill-current text-white dark:text-black" />
            </div> */}
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    <div className="gap-.5 flex flex-col">
                        <span>{name}</span>
                        <span>{description}</span>
                    </div>
                </span>
            </div>
        </>
    );
}
