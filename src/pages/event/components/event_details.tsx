import {useGetIdentity} from "@refinedev/core";
import {Descriptions, Spin} from "antd";
import {useEffect, useState} from "react";
import {gqlDataProvider} from "../../../api";
import {UserData, EventData} from "../../../interfaces";
import {useParams} from "react-router-dom";
import {EventAgendasListComponent} from "./agendas_list";
import moment from "moment";

interface Props {
  rand?: any;
  eventId?: number | null;
}

export const EventDetailsComponent: React.FC<Props> = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<EventData | null>(null);
  const {data: user} = useGetIdentity<UserData>();

  //   get event id from url
  const {id} = useParams<{id: string}>();

  const getEvent = async () => {
    setLoading(true);
    const {data} = await gqlDataProvider.custom!<EventData>({
      url: "",
      method: "get",
      meta: {
        operation: "event",
        variables: {
          id: {
            value: parseInt(props.eventId?.toString() ?? "0"),
            type: "Int",
            required: true,
          },
        },
        fields: [
          "id",
          "title",
          "description",
          "startTime",
          "endTime",
          "created",
          "updated",
          "isActive",
          {
            author: [
              "id",
              "email",
              "phone",
              "firstName",
              "middleName",
              "lastName",
              "avatar",
            ],
          },
          {
            venue: [
              "id",
              "name",
              "description",
              "capacity",
              "venueType",
              "created",
              "updated",
            ],
          },
        ],
      },
    })
      .catch(() => {
        return {data: null};
      })
      .then((data) => {
        return data;
      });
    if (data) {
      setEvent(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getEvent();
  }, []);

  return (
    <>
      <Spin spinning={loading}>
        <Descriptions title="" column={1}>
          <Descriptions.Item label="Event Title">
            {event?.title}
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {event?.description}
          </Descriptions.Item>
          <Descriptions.Item label="Start At">
            {moment(event?.startTime).format("DD MMM YYYY hh:mm A")}
          </Descriptions.Item>
          <Descriptions.Item label="Will End At">
            {moment(event?.endTime).format("DD MMM YYYY hh:mm A")}
          </Descriptions.Item>
          <Descriptions.Item label="Venue">
            {event?.venue?.name}
          </Descriptions.Item>
          <Descriptions.Item label="Creatd By">
            {event?.author?.firstName} {event?.author?.middleName}{" "}
            {event?.author?.lastName}
          </Descriptions.Item>
        </Descriptions>
      </Spin>
    </>
  );
};
