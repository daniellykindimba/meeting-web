import {
  CloseOutlined,
  FolderAddOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {useGetIdentity} from "@refinedev/core";
import {
  Alert,
  Avatar,
  Button,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Row,
  Select,
  Tooltip,
  message,
} from "antd";
import {useEffect, useState} from "react";
import {
  CommitteeData,
  EventAttendeeData,
  UserCommitteeData,
  UserData,
} from "../../../../../interfaces";
import {gqlDataProvider} from "../../../../../api";
import {AddingMeetingAttendeesComponent} from "../../../../meetings/adding_attendees";
import {AddingCommitteesMembersComponent} from "./adding_members";

const {TextArea} = Input;

const {Option} = Select;

interface formData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  venueId: number;
}

interface Props {
  onFinish: any;
  committee?: CommitteeData | null;
}

export const CommitteeMembersListComponent: React.FC<Props> = (
  props: Props
) => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [members, setMembers] = useState<UserCommitteeData[]>([]);
  const [addingCommitteeMemberModal, setAddingCommitteeMemberModal] =
    useState(false);
  const [form] = Form.useForm<formData>();
  const {data: user} = useGetIdentity<UserData>();

  const getCommitteeMembers = async (key = "", page = 1, pageSize = 25) => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "get",
      meta: {
        operation: "committeeMembers",
        variables: {
          id: {
            value: props.committee?.id,
            type: "Int",
            required: true,
          },
        },
        fields: [
          "total",
          "page",
          "pages",
          {
            results: [
              "id",
              {
                committee: ["id"],
              },
              {
                user: [
                  "id",
                  "email",
                  "phone",
                  "firstName",
                  "middleName",
                  "lastName",
                  "avatar",
                ],
              },
            ],
          },
        ],
      },
    })
      .catch((error) => {
        console.error(error);
        return {data: null};
      })
      .then((data) => {
        return data;
      });
    if (data) {
      setMembers(data.results);
      setTotal(data.total);
      setPage(data.page);
    }
    setLoading(false);
  };

  const removeMember = async (id: number) => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!({
      url: "",
      method: "post",
      meta: {
        operation: "deleteCommitteeMember",
        variables: {
          id: {
            value: id,
            type: "Int",
            required: true,
          },
        },
        fields: ["success", "message"],
      },
    })
      .catch((error) => {
        console.error(error);
        return {data: null};
      })
      .then((data) => {
        return data;
      });

    if (data) {
      if (data.success) {
        message.success(data.message);
        setMembers(members.filter((member) => member.id !== id));
      } else {
        message.error(data.message);
      }
    }
    setLoading(false);
  };

  const onFinishAddingAttendee = async (member: UserCommitteeData) => {
    setMembers([member, ...members]);
  };

  useEffect(() => {
    getCommitteeMembers();
  }, []);

  return (
    <>
      <Row>
        <Col span={14}>
          <Form
            name="basic"
            onFinish={(values) => {
              getCommitteeMembers(values.q, 1, limit);
            }}
            autoComplete="off"
          >
            <Form.Item
              name="q"
              rules={[{required: false, message: "Search Meetings!"}]}
            >
              <Input
                size="large"
                type="search"
                placeholder="Search ...."
                allowClear
              />
            </Form.Item>
          </Form>
        </Col>

        <Col span={10} style={{display: "flex", justifyContent: "flex-end"}}>
          <Button
            size="large"
            icon={<FolderAddOutlined />}
            onClick={() => setAddingCommitteeMemberModal(true)}
            type="primary"
          >
            Add Member
          </Button>
        </Col>
      </Row>
      <div
        style={{
          maxHeight: "70vh",
        }}
      >
        <List
          itemLayout="horizontal"
          dataSource={members}
          renderItem={(member, index) => (
            <List.Item
              actions={[
                <Popconfirm
                  title="Are you sure to Remove this user from the Committee?"
                  description="Are you sure?"
                  onConfirm={() => {
                    removeMember(member.id);
                  }}
                  onCancel={() => {
                    console.log("adding");
                  }}
                  okText="Remove"
                  cancelText="No"
                >
                  <Button icon={<CloseOutlined />}></Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${index}`}
                  />
                }
                title={
                  <a href="https://ant.design">
                    {member.user.firstName +
                      " " +
                      member.user.middleName +
                      " " +
                      member.user.lastName}
                  </a>
                }
                description={member.user.email + " ===> " + member.user.phone}
              />
            </List.Item>
          )}
        />
      </div>

      <Drawer
        title="Adding Committee Member"
        placement="right"
        destroyOnClose={true}
        width={"40vw"}
        onClose={() => setAddingCommitteeMemberModal(false)}
        open={addingCommitteeMemberModal}
      >
        {props.committee && (
          <AddingCommitteesMembersComponent
            committee={props.committee}
            onFinish={onFinishAddingAttendee}
          />
        )}
      </Drawer>
    </>
  );
};
