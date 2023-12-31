import {useGetIdentity} from "@refinedev/core";
import {Spin} from "antd";
import {useEffect, useState} from "react";
import {gqlDataProvider} from "../../../api";
import {UserData, EventData} from "../../../interfaces";
import {useParams} from "react-router-dom";
import {EventAgendasListComponent} from "./agendas_list";

interface Props {
  rand?: any;
}

export const EventAgendasComponent: React.FC<Props> = () => {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [events, setEvents] = useState<EventData[]>([]);
  const [event, setEvent] = useState<EventData | null>(null);
  const {data: user} = useGetIdentity<UserData>();

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
            value: parseInt(id?.toString() ?? "0"),
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

    console.log(data);
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
        {event && <EventAgendasListComponent event={event} />}
      </Spin>
    </>
  );
};
