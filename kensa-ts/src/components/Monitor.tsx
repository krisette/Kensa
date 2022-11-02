import React, { useContext, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import PlaygroundContainer from "./PlaygroundContainer";
import MetricContainer from "./MetricContainer";
import ProjectInfo from './ProjectInfo';
import { Box, Center, Spinner, Alert, AlertIcon, Stack, Heading, Icon, Button, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverHeader, PopoverBody } from '@chakra-ui/react';
import { BsFillArrowLeftCircleFill } from 'react-icons/bs';
import { TbRefresh } from 'react-icons/tb';
import Cookies from 'js-cookie';
import { Link } from 'react-router-dom';
import { ThemeContext } from './App';
import { darkTheme } from '../theme/darkTheme';

const Monitor = () => {
  const { projectId } = useParams();

  const { theme } = useContext(ThemeContext);

  Cookies.set('projectId', projectId);  // set projectId cookie so last seen project is displayed when clicked on Metrics tab

  // Refetch data when user click back to the project/Metrics Tab on the sidebar
  useEffect(() => {
    refetch({ projectId: projectId });
  }, []);

  const GET_PROJECT_DATA = gql`
    query GetProjectData($projectId: ID!) {
      project(id: $projectId) {
        project_name
        server_url
        api_key
        user {
          username
        }
        history_log {
          id
          operation_name
          query_string
          execution_time
          created_at
          success
        }
      }
    }
`;

  const { loading, error, data, refetch } = useQuery(GET_PROJECT_DATA, {
    variables: {
      projectId: projectId
    },
    // pollInterval: 10000,  // polling every 10 seconds
  });

  
  if (loading) {
    return (
      <Center w='100%' h='100%'>
        <Spinner size='xl'/>
      </Center>
    );
  }
  
  if (error) {
    return (
      <Center w='100%' h='100%'>
        <Alert status='error' h='100px' w='50%' borderRadius='10px'>
          <AlertIcon />
          There was an error processing your request
        </Alert>
      </Center>
    );
  }

  return (
    <Stack direction='column' p={'20px'} id='monitor'>
      <Stack spacing={4} direction='row' align='center'>
        <Link to={`/user/${data.project.user.username}`}><Icon as={BsFillArrowLeftCircleFill} fontSize='1.3rem'/></Link>
        <Heading size='md'>Project Name: {data.project['project_name']}</Heading>
        <Popover>
          <PopoverTrigger>
            <Button size='xs' colorScheme='facebook'>Info</Button>
          </PopoverTrigger>
          <PopoverContent style={theme === 'dark' && darkTheme}>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader><Heading size='xs'>Project Info</Heading></PopoverHeader>
            <PopoverBody><ProjectInfo projectId={projectId} apiKey={data.project['api_key']} /></PopoverBody>
          </PopoverContent>
        </Popover>
        <Box onClick={() => refetch({ projectId: projectId })} _hover={{ cursor: 'pointer' }} fontSize='1.5rem'><TbRefresh /></Box>
      </Stack>
      {/* <PlaygroundContainer /> */}
      <MetricContainer historyLogs={data.project['history_log']}/>
    </Stack>
  );
};

export default Monitor;