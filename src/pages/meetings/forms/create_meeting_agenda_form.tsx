import {useGetIdentity} from "@refinedev/core";
import {Button, Form, Input, SelectProps, message} from "antd";
import {useEffect, useState} from "react";
import {gqlDataProvider} from "../../../api";
import {EventData, UserData, DepartmentData} from "../../../interfaces";

const {TextArea} = Input;

interface formData {
  title: string;
  description: string;
}

interface Props {
  onFinish: any;
  event?: EventData | null;
}

const options: SelectProps["options"] = [];

export const CreateMeetingAgendaFormComponent: React.FC<Props> = (
  props: Props
) => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [members, setMembers] = useState<UserData[]>([]);
  const [addingAttendeeModal, setAddingAttendeeModal] = useState(false);
  const [form] = Form.useForm<formData>();
  const {data: user} = useGetIdentity<UserData>();
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);

  const createAgenda = async (values: formData) => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "post",
      meta: {
        operation: "createEventAgenda",
        variables: {
          eventId: {
            value: props.event?.id,
            required: true,
            type: "Int",
          },
          title: {
            value: values.title,
            required: true,
            type: "String",
          },
        },
        fields: [
          "success",
          "message",
          {
            eventAgenda: [
              "id",
              "title",
              "description",
              "created",
              "updated",
              "isActive",
            ],
          },
        ],
      },
    })
      .catch((error: any) => {
        console.error(error);
        return {data: null};
      })
      .then((data: any) => {
        return data;
      });
    if (data) {
      if (data.success) {
        props.onFinish(data.eventAgenda);
      }
    }
    setLoading(false);
  };

  useEffect(() => {}, []);

  return (
    <>
      <Form<formData>
        form={form}
        layout="vertical"
        onFinish={(values) => {
          createAgenda(values);
        }}
        onFinishFailed={() => {
          message.error("Please fill all required fields");
        }}
        autoComplete="off"
      >
        <Form.Item
          label="Content"
          name="title"
          rules={[{required: false, message: "Agenda Content!"}]}
        >
          <TextArea rows={8} size="large" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            style={{float: "left"}}
            onClick={() => form.resetFields()}
          >
            Clear
          </Button>
          <Button type="primary" htmlType="submit" style={{float: "right"}}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};
