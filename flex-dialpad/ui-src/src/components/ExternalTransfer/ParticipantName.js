import * as React from 'react';
import { connect } from 'react-redux';
import styled from '@emotion/styled';
import { withTheme } from '@twilio/flex-ui';
import ConferenceService from '../../services/ConferenceService';

const Name = styled('div')`
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.25rem;
  margin-top: 0.75rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NameListItem = styled('div')`
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.25rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

class ParticipantName extends React.Component {
  state = {
    name: '',
  };

  componentDidMount() {
    const { participant, task } = this.props;

    if (participant.participantType === 'customer') {
      this.setState({
        name:
          task.attributes.outbound_to ||
          task.attributes.name ||
          task.attributes.from,
      });
      return;
    }

    if (participant.participantType === 'unknown') {
      ConferenceService.getCallProperties(participant.callSid)
        .then((response) => {
          if (response) {
            const name = (response && response.to) || 'Unknown';
            this.setState({ name });
          }
        })
        .catch((_error) => {
          const name = 'Unknown';
          this.setState({ name });
        });
    } else {
      this.setState({
        name: participant.worker ? participant.worker.fullName : 'Unknown',
      });
    }
  }

  render() {
    return this.props.listMode ? (
      <NameListItem className="ParticipantCanvas-Name">
        {this.state.name}
      </NameListItem>
    ) : (
      <Name className="ParticipantCanvas-Name">{this.state.name}</Name>
    );
  }
}

const mapStateToProps = (state) => {
  const { serviceBaseUrl } = state.flex.config;

  return {
    serviceBaseUrl,
  };
};

export default connect(mapStateToProps)(withTheme(ParticipantName));
