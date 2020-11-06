import React from 'react';

class ChangeField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editMode: false
    };
  }

  render() {
    const editField = () => this.setState({ editMode: true });
    const closeEditing = () => {
        this.setState({ editMode: false });
    }
    const handleKeyUp = (e) => {
        if(e.which === 13) {
            closeEditing();
            this.props.keyUpHandler();
        }
    }
    let InputField = null;
        
    if (this.state.editMode === false) {
        if(this.props.field === 'name') {
            InputField =  (
                <input className="input-field inputedit" ref={this.props.field} type="text" placeholder="Type here" defaultValue={this.props.value} onClick={editField} onFocus={editField} />
            );
        } else {
            InputField = (
                <input className="input-field inputedit" ref={this.props.field} type="password" placeholder="Type here" value={this.props.value} onClick={editField} onFocus={editField} />
            );
        }

    } else {
        if(this.props.field === 'name') {
            InputField = (
                <input className="input-field inputeditenable" ref={this.props.field} type="text" defaultValue={this.props.value} placeholder="Type here" onChange={(event) => this.props.changeHandler(this.props.field, event)} onBlur={closeEditing} onKeyUp={handleKeyUp}/>
            );
        } else {
            InputField = (
                <input className="input-field inputeditenable" ref={this.props.field} type="password" value={this.props.value} placeholder="Type here" onChange={(event) => this.props.changeHandler(this.props.field, event)} onBlur={closeEditing} onKeyUp={handleKeyUp}/>
            );
        }

    }

    return (
        <div>
            {InputField}
        </div>
    );
  }
}

export default ChangeField;