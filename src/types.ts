export type Task={id:string;user_id:string;title:string;description:string|null;category:string;priority:string;due_date:string;completed:boolean;completed_at:string|null;created_at:string;updated_at:string};
export type RestDay={user_id:string;rest_date:string};
export type Profile={id:string;name:string|null;email:string|null;whatsapp:string|null;report_frequency:string;delivery_method:string;timezone:string};
