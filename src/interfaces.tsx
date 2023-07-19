
export interface UserData {
    id: number;
    email: string;
    phone: string;
    firstName: string;
    middleName: string;
    lastName: string;
    avatar: string;
    isStaff: boolean;
    isAdmin: boolean;
    created: string;
    updated: string;
    isActive: boolean;
}



export interface DepartmentData {
    id: number;
    name: string;
    description: string;
    created: string;
    updated: string;
    isActive: boolean;
}

export interface UserDepartmentData {
    id: number;
    user: UserData;
    department: DepartmentData;
    created: string;
    updated: string;
    isActive: boolean;
}


export interface VenueData {
    id: number;
    name: string;
    description: string;
    venueType: string;
    capacity: number;
    created: string;
    updated: string;
    isActive: boolean;
}





export interface EventData {
    id: number;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    created: string;
    updated: string;
    isActive: boolean;
    author: UserData;
    venue: VenueData;
}


export interface EventDepartmentData {
    id: number;
    event: EventData;
    department: DepartmentData;
    created: string;
    updated: string;
    isActive: boolean;
}


export interface EventAttendeeData {
    id: number;
    event: EventData;
    attendee: UserData;
    isAttending: boolean;
    created: string;
    updated: string;
    isActive: boolean;
}

export interface EventAgendaData {
    id: number;
    event: EventData;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    created: string;
    updated: string;
    isActive: boolean;
}


export interface EventDocumentData {
    id: number;
    event: EventData;
    title: string;
    description: string;
    file: string;
    created: string;
    updated: string;
    isActive: boolean;
}